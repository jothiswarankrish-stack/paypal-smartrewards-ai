import uuid
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
import models
import schemas

router = APIRouter(prefix="/api/donations", tags=["Rewards for Good - Social Impact"])

def generate_paypal_ref():
    return f"PPRFG-TX-{datetime.utcnow().strftime('%Y%m%d')}-{uuid.uuid4().hex[:8].upper()}"

@router.get("/beneficiaries", response_model=List[schemas.DonationBeneficiaryResponse])
def get_beneficiaries(db: Session = Depends(get_db)):
    """
    List all active vetted nonprofit beneficiaries for the PayPal Rewards for Good initiative.
    """
    beneficiaries = (
        db.query(models.DonationBeneficiary)
        .filter(models.DonationBeneficiary.is_active == True)
        .all()
    )
    return beneficiaries

@router.get("/customer-balance/{customer_id}", response_model=schemas.CustomerRewardBalanceResponse)
def get_customer_reward_balance(customer_id: str, db: Session = Depends(get_db)):
    """
    Retrieve current customer available reward balance, total donated, and cash redeemed.
    """
    user = db.query(models.User).filter(models.User.id == customer_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Customer not found")

    profile = db.query(models.CustomerProfile).filter(models.CustomerProfile.user_id == customer_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Customer profile not found")

    # Ensure baseline reward points
    if profile.available_reward_points is None:
        profile.available_reward_points = 500.0
        db.commit()
        db.refresh(profile)

    return schemas.CustomerRewardBalanceResponse(
        customer_id=customer_id,
        available_reward_points=round(profile.available_reward_points or 0.0, 2),
        total_donated=round(profile.total_donated or 0.0, 2),
        total_cash_redeemed=round(profile.total_cash_redeemed or 0.0, 2),
        currency="INR",
        last_updated=profile.created_at or datetime.utcnow(),
    )

@router.post("/contribute", response_model=schemas.DonationReceiptResponse)
def contribute_donation(payload: schemas.DonationContributeRequest, db: Session = Depends(get_db)):
    """
    Voluntarily contribute a chosen portion of earned reward balance to a nonprofit beneficiary.
    Enforces customer consent, balance sufficiency, positive amounts, and generates an official receipt.
    """
    if payload.amount <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Donation amount must be strictly greater than zero."
        )

    if not payload.customer_consent:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Voluntary customer consent is required to process donation."
        )

    user = db.query(models.User).filter(models.User.id == payload.customer_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Customer not found.")

    profile = db.query(models.CustomerProfile).filter(models.CustomerProfile.user_id == payload.customer_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Customer profile not found.")

    current_balance = profile.available_reward_points or 0.0
    if payload.amount > current_balance:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Requested donation amount (₹{payload.amount:.2f}) exceeds available reward balance (₹{current_balance:.2f})."
        )

    beneficiary = db.query(models.DonationBeneficiary).filter(models.DonationBeneficiary.id == payload.beneficiary_id).first()
    if not beneficiary or not beneficiary.is_active:
        raise HTTPException(status_code=404, detail="Specified beneficiary not found or inactive.")

    # Idempotency check if idempotency_key was passed in source_type or reference
    ref_id = generate_paypal_ref()
    if payload.idempotency_key:
        existing_don = db.query(models.RewardDonation).filter(models.RewardDonation.paypal_reference_id == payload.idempotency_key).first()
        if existing_don:
            return schemas.DonationReceiptResponse(
                success=True,
                receipt_id=existing_don.id,
                customer_id=existing_don.customer_id,
                beneficiary_id=existing_don.beneficiary_id,
                beneficiary_name=beneficiary.name,
                donation_amount=existing_don.amount,
                cash_redeemed=0.0,
                remaining_balance=round(profile.available_reward_points, 2),
                currency=existing_don.currency,
                source_type=existing_don.source_type,
                paypal_reference_id=existing_don.paypal_reference_id,
                status=existing_don.status,
                timestamp=existing_don.created_at,
                message="Duplicate request recognized: existing donation record returned."
            )

    # Perform atomic ledger balance deduction
    profile.available_reward_points = round(current_balance - payload.amount, 2)
    profile.total_donated = round((profile.total_donated or 0.0) + payload.amount, 2)

    beneficiary.total_received = round((beneficiary.total_received or 0.0) + payload.amount, 2)
    beneficiary.donor_count = (beneficiary.donor_count or 0) + 1

    donation_record = models.RewardDonation(
        customer_id=payload.customer_id,
        beneficiary_id=payload.beneficiary_id,
        amount=payload.amount,
        currency=payload.currency,
        source_type=payload.source_type,
        customer_consent=payload.customer_consent,
        paypal_reference_id=ref_id,
        status="COMPLETED",
        created_at=datetime.utcnow()
    )
    db.add(donation_record)
    db.commit()
    db.refresh(donation_record)

    return schemas.DonationReceiptResponse(
        success=True,
        receipt_id=donation_record.id,
        customer_id=payload.customer_id,
        beneficiary_id=beneficiary.id,
        beneficiary_name=beneficiary.name,
        donation_amount=payload.amount,
        cash_redeemed=0.0,
        remaining_balance=profile.available_reward_points,
        currency=payload.currency,
        source_type=payload.source_type,
        paypal_reference_id=ref_id,
        status="COMPLETED",
        timestamp=donation_record.created_at,
        message=f"Thank you! ₹{payload.amount:.2f} voluntarily contributed to {beneficiary.name}."
    )

@router.post("/convert-cash", response_model=schemas.DonationReceiptResponse)
def convert_rewards_to_cash(payload: schemas.CashConversionRequest, db: Session = Depends(get_db)):
    """
    Convert earned reward points into PayPal cash balance with optional voluntary donation split.
    If donation_amount == 0, full amount is converted to cash.
    If donation_amount > 0, donation is routed to chosen beneficiary and remainder is paid out in cash.
    """
    if payload.amount_to_redeem <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Redemption amount must be strictly greater than zero."
        )

    if payload.donation_amount < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Donation amount cannot be negative."
        )

    if payload.donation_amount > payload.amount_to_redeem:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Donation amount (₹{payload.donation_amount:.2f}) cannot exceed gross redemption amount (₹{payload.amount_to_redeem:.2f})."
        )

    user = db.query(models.User).filter(models.User.id == payload.customer_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Customer not found.")

    profile = db.query(models.CustomerProfile).filter(models.CustomerProfile.user_id == payload.customer_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Customer profile not found.")

    current_balance = profile.available_reward_points or 0.0
    if payload.amount_to_redeem > current_balance:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Redemption amount (₹{payload.amount_to_redeem:.2f}) exceeds available reward points (₹{current_balance:.2f})."
        )

    beneficiary = None
    if payload.donation_amount > 0:
        if not payload.customer_consent:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Customer consent is required when including a voluntary donation."
            )
        if not payload.beneficiary_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A valid beneficiary must be selected for the voluntary donation."
            )
        beneficiary = db.query(models.DonationBeneficiary).filter(models.DonationBeneficiary.id == payload.beneficiary_id).first()
        if not beneficiary or not beneficiary.is_active:
            raise HTTPException(status_code=404, detail="Beneficiary not found or inactive.")

    # Calculate net cash and donation
    donation_amt = payload.donation_amount
    cash_redeemed = round(payload.amount_to_redeem - donation_amt, 2)
    ref_id = generate_paypal_ref()

    # Deduct gross redemption from rewards
    profile.available_reward_points = round(current_balance - payload.amount_to_redeem, 2)
    profile.total_cash_redeemed = round((profile.total_cash_redeemed or 0.0) + cash_redeemed, 2)

    receipt_id = str(uuid.uuid4())

    if donation_amt > 0 and beneficiary:
        profile.total_donated = round((profile.total_donated or 0.0) + donation_amt, 2)
        beneficiary.total_received = round((beneficiary.total_received or 0.0) + donation_amt, 2)
        beneficiary.donor_count = (beneficiary.donor_count or 0) + 1

        donation_record = models.RewardDonation(
            id=receipt_id,
            customer_id=payload.customer_id,
            beneficiary_id=beneficiary.id,
            amount=donation_amt,
            currency=payload.currency,
            source_type="cash_conversion",
            customer_consent=payload.customer_consent,
            paypal_reference_id=ref_id,
            status="COMPLETED",
            created_at=datetime.utcnow()
        )
        db.add(donation_record)

    db.commit()

    msg = f"Successfully converted ₹{cash_redeemed:.2f} to your PayPal wallet balance."
    if donation_amt > 0 and beneficiary:
        msg += f" Plus ₹{donation_amt:.2f} contributed to {beneficiary.name}."

    return schemas.DonationReceiptResponse(
        success=True,
        receipt_id=receipt_id,
        customer_id=payload.customer_id,
        beneficiary_id=beneficiary.id if beneficiary else None,
        beneficiary_name=beneficiary.name if beneficiary else None,
        donation_amount=donation_amt,
        cash_redeemed=cash_redeemed,
        remaining_balance=profile.available_reward_points,
        currency=payload.currency,
        source_type="cash_conversion",
        paypal_reference_id=ref_id,
        status="COMPLETED",
        timestamp=datetime.utcnow(),
        message=msg
    )

@router.get("/analytics", response_model=schemas.SocialImpactStatsResponse)
def get_social_impact_analytics(db: Session = Depends(get_db)):
    """
    Returns aggregated social impact performance metrics, per-beneficiary totals,
    and a real-time donation ledger for AG Grid and executive dashboards.
    """
    all_donations = (
        db.query(models.RewardDonation)
        .filter(models.RewardDonation.status == "COMPLETED")
        .order_by(models.RewardDonation.created_at.desc())
        .all()
    )

    total_donated = sum(d.amount for d in all_donations)
    unique_donors = len(set(d.customer_id for d in all_donations))
    avg_donation = round(total_donated / len(all_donations), 2) if all_donations else 0.0

    beneficiaries = db.query(models.DonationBeneficiary).filter(models.DonationBeneficiary.is_active == True).all()
    beneficiary_stats = []
    for b in beneficiaries:
        pct = round((b.total_received / total_donated * 100.0), 1) if total_donated > 0 else 0.0
        beneficiary_stats.append(
            schemas.SocialImpactBeneficiaryStat(
                beneficiary_id=b.id,
                name=b.name,
                category=b.category,
                total_received=round(b.total_received or 0.0, 2),
                donor_count=b.donor_count or 0,
                percentage_of_total=pct
            )
        )

    # Build recent donations with customer and beneficiary labels
    recent_donations = []
    for d in all_donations[:50]:
        cust_name = "Customer"
        if d.customer:
            cust_name = d.customer.full_name
        b_name = d.beneficiary.name if d.beneficiary else "Charity Partner"
        recent_donations.append(
            schemas.SocialImpactRecentDonation(
                id=d.id,
                customer_name=cust_name,
                beneficiary_name=b_name,
                amount=round(d.amount, 2),
                currency=d.currency or "INR",
                source_type=d.source_type or "reward_balance",
                paypal_reference_id=d.paypal_reference_id,
                timestamp=d.created_at
            )
        )

    return schemas.SocialImpactStatsResponse(
        total_donated=round(total_donated, 2),
        total_donors_count=unique_donors,
        avg_donation_amount=avg_donation,
        currency="INR",
        beneficiaries=beneficiary_stats,
        recent_donations=recent_donations
    )
