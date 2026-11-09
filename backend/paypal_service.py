import httpx
import uuid
import base64
from decimal import Decimal, ROUND_HALF_UP
from typing import Dict, Any, Optional
from config import settings

class PayPalService:
    def __init__(self):
        self.client_id = settings.PAYPAL_CLIENT_ID
        self.client_secret = settings.PAYPAL_CLIENT_SECRET
        self.base_url = settings.PAYPAL_BASE_URL.rstrip('/')
        self.access_token: Optional[str] = None
        self.is_simulated = (
            not self.client_id or 
            "mock" in self.client_id.lower() or 
            self.client_id.startswith("sandbox_mock")
        )

    async def get_access_token(self) -> Optional[str]:
        """
        Authenticate with PayPal Sandbox OAuth2 endpoint:
        POST /v1/oauth2/token
        """
        if self.is_simulated:
            return "MOCK_SANDBOX_ACCESS_TOKEN_VERIFIED"

        auth_str = f"{self.client_id}:{self.client_secret}"
        encoded_auth = base64.b64encode(auth_str.encode()).decode()

        headers = {
            "Authorization": f"Basic {encoded_auth}",
            "Content-Type": "application/x-www-form-urlencoded"
        }
        data = {"grant_type": "client_credentials"}

        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(f"{self.base_url}/v1/oauth2/token", headers=headers, data=data)
            if resp.status_code == 200:
                token_data = resp.json()
                self.access_token = token_data.get("access_token")
                return self.access_token
            else:
                print(f"Failed to obtain PayPal Sandbox access token: {resp.status_code} - {resp.text}")
                return None

    def calculate_discount(self, original_amount: float, discount_type: str, discount_value: float, max_discount: Optional[float] = None) -> Dict[str, Decimal]:
        """
        Safe financial Decimal arithmetic for discounts and final totals.
        """
        orig = Decimal(str(original_amount)).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        disc_val = Decimal(str(discount_value)).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        
        if discount_type == "percentage":
            raw_discount = (orig * disc_val / Decimal('100.00')).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
            if max_discount is not None:
                max_d = Decimal(str(max_discount)).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
                discount_amount = min(raw_discount, max_d)
            else:
                discount_amount = raw_discount
        else: # fixed discount
            discount_amount = min(orig, disc_val)

        final_amount = max(Decimal('0.01'), orig - discount_amount).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)

        return {
            "original_amount": orig,
            "discount_amount": discount_amount,
            "final_amount": final_amount
        }

    async def create_order(
        self,
        final_amount: Decimal,
        currency: str = "USD",
        description: str = "PayPal SmartRewards AI Order",
        custom_id: str = None
    ) -> Dict[str, Any]:
        """
        Create a PayPal Sandbox order using Orders API v2:
        POST /v2/checkout/orders
        """
        amount_str = f"{final_amount:.2f}"

        if self.is_simulated:
            simulated_order_id = f"ORDER-SANDBOX-{uuid.uuid4().hex[:10].upper()}"
            return {
                "id": simulated_order_id,
                "status": "CREATED",
                "links": [
                    {
                        "href": f"https://www.sandbox.paypal.com/checkoutnow?token={simulated_order_id}",
                        "rel": "approve",
                        "method": "GET"
                    }
                ]
            }

        token = await self.get_access_token()
        if not token:
            raise Exception("Unable to authenticate with PayPal Sandbox API.")

        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {token}",
            "Prefer": "return=representation"
        }

        payload = {
            "intent": "CAPTURE",
            "purchase_units": [
                {
                    "reference_id": custom_id or str(uuid.uuid4()),
                    "description": description[:120],
                    "amount": {
                        "currency_code": currency,
                        "value": amount_str
                    }
                }
            ],
            "application_context": {
                "brand_name": "PayPal SmartRewards AI",
                "landing_page": "NO_PREFERENCE",
                "user_action": "PAY_NOW",
                "return_url": f"{settings.FRONTEND_URL}/payment-success",
                "cancel_url": f"{settings.FRONTEND_URL}/payment-cancelled"
            }
        }

        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(f"{self.base_url}/v2/checkout/orders", headers=headers, json=payload)
            if resp.status_code in (200, 201):
                return resp.json()
            else:
                raise Exception(f"PayPal Order Creation error: {resp.status_code} - {resp.text}")

    async def capture_order(self, paypal_order_id: str) -> Dict[str, Any]:
        """
        Capture payment for an approved order:
        POST /v2/checkout/orders/{order_id}/capture
        """
        if self.is_simulated:
            capture_id = f"CAPTURE-SANDBOX-{uuid.uuid4().hex[:12].upper()}"
            return {
                "id": paypal_order_id,
                "status": "COMPLETED",
                "purchase_units": [
                    {
                        "payments": {
                            "captures": [
                                {
                                    "id": capture_id,
                                    "status": "COMPLETED",
                                    "amount": {"currency_code": "USD", "value": "12.50"}
                                }
                            ]
                        }
                    }
                ],
                "payer": {
                    "email_address": "sandbox-buyer@smartrewards.ai",
                    "name": {"given_name": "Demo", "surname": "SandboxBuyer"}
                }
            }

        token = await self.get_access_token()
        if not token:
            raise Exception("Unable to authenticate with PayPal Sandbox API.")

        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {token}",
            "Prefer": "return=representation"
        }

        async with httpx.AsyncClient(timeout=12.0) as client:
            resp = await client.post(
                f"{self.base_url}/v2/checkout/orders/{paypal_order_id}/capture",
                headers=headers
            )
            if resp.status_code in (200, 201):
                return resp.json()
            else:
                raise Exception(f"PayPal Payment Capture error: {resp.status_code} - {resp.text}")

paypal_service = PayPalService()
