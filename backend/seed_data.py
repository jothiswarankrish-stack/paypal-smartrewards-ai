import random
from datetime import datetime, timedelta
from database import SessionLocal, engine, Base
import models

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Check if already seeded with all 5 customers
        existing_cust_e = db.query(models.User).filter_by(email="customer.e@smartrewards.ai").first()
        if existing_cust_e:
            print("Database already contains all 5 customer profiles and seed data. Skipping.")
            return

        # If partial or empty, clean and re-seed
        print("Seeding PayPal SmartRewards AI database with 5 customer cohorts, 10 merchants, and 20+ coupons...")
        db.query(models.CouponRedemption).delete()
        db.query(models.RecommendationEvent).delete()
        db.query(models.Recommendation).delete()
        db.query(models.PayPalOrder).delete()
        db.query(models.CustomerSavings).delete()
        db.query(models.Transaction).delete()
        db.query(models.Coupon).delete()
        db.query(models.Merchant).delete()
        db.query(models.CustomerProfile).delete()
        db.query(models.User).delete()
        db.query(models.TransactionCategory).delete()
        db.commit()

        # 1. Categories
        categories = [
            models.TransactionCategory(id="food", name="Food & Dining", slug="food", description="Restaurants, food delivery and gourmet dining", icon="UtensilsCrossed"),
            models.TransactionCategory(id="taxi", name="Taxi & Mobility", slug="taxi", description="Cabs, auto, bike taxis and rentals", icon="Car"),
            models.TransactionCategory(id="shopping", name="Online Shopping", slug="shopping", description="Fashion, electronics and lifestyle", icon="ShoppingBag"),
            models.TransactionCategory(id="groceries", name="Groceries & Quick Mart", slug="groceries", description="Daily essentials, fruits and pantry", icon="Apple"),
            models.TransactionCategory(id="entertainment", name="Entertainment & Cinema", slug="entertainment", description="Movies, streaming and live concerts", icon="Film"),
            models.TransactionCategory(id="travel", name="Travel & Hotels", slug="travel", description="Flights, trains, resorts and getaways", icon="Plane"),
        ]
        db.add_all(categories)
        db.commit()

        # 2. Five Distinct Customers
        users = [
            # Customer A: Food Delivery Enthusiast
            models.User(id="user-cust-a-001", email="customer.a@smartrewards.ai", full_name="Ananya Sharma", role="customer"),
            # Customer B: Frequent Commuter
            models.User(id="user-cust-b-002", email="customer.b@smartrewards.ai", full_name="Rohan Verma", role="customer"),
            # Customer C: Online Shopping Enthusiast
            models.User(id="user-cust-c-003", email="customer.c@smartrewards.ai", full_name="Priya Nair", role="customer"),
            # Customer D: Grocery & Home Essentials Buyer
            models.User(id="user-cust-d-004", email="customer.d@smartrewards.ai", full_name="Rajesh Kumar", role="customer"),
            # Customer E: Travel & Entertainment Seeker
            models.User(id="user-cust-e-005", email="customer.e@smartrewards.ai", full_name="Sneha Patel", role="customer"),
            # Merchant Partner
            models.User(id="user-merchant-001", email="partner@freshbite.com", full_name="FreshBite Gourmet Corp", role="merchant"),
            # Admin User
            models.User(id="user-admin-001", email="admin@smartrewards.ai", full_name="Platform Administrator", role="admin"),
        ]
        db.add_all(users)
        db.commit()

        profiles = [
            models.CustomerProfile(
                id="prof-cust-a-001",
                user_id="user-cust-a-001",
                persona_name="Food Delivery Enthusiast",
                persona_description="Spends predominantly on Swiggy & Zomato (₹6,000/mo) with moderate taxi rides.",
                monthly_budget=16000.0,
                preferred_payment_method="paypal"
            ),
            models.CustomerProfile(
                id="prof-cust-b-002",
                user_id="user-cust-b-002",
                persona_name="Frequent Taxi Commuter",
                persona_description="Daily cab & auto commuter (₹7,000/mo on Uber/Ola) across city hubs & airport trips.",
                monthly_budget=18000.0,
                preferred_payment_method="paypal"
            ),
            models.CustomerProfile(
                id="prof-cust-c-003",
                user_id="user-cust-c-003",
                persona_name="Online Shopping Enthusiast",
                persona_description="Passionate e-commerce shopper spending ₹8,000/mo on Myntra, Ajio, and Amazon.",
                monthly_budget=20000.0,
                preferred_payment_method="paypal"
            ),
            models.CustomerProfile(
                id="prof-cust-d-004",
                user_id="user-cust-d-004",
                persona_name="Groceries & Quick Commerce Buyer",
                persona_description="Family pantry manager spending ₹6,500/mo on Blinkit, Zepto, and organic markets.",
                monthly_budget=15000.0,
                preferred_payment_method="paypal"
            ),
            models.CustomerProfile(
                id="prof-cust-e-005",
                user_id="user-cust-e-005",
                persona_name="Travel & Entertainment Seeker",
                persona_description="Active weekend traveler spending ₹7,500/mo on MakeMyTrip, flights & BookMyShow.",
                monthly_budget=25000.0,
                preferred_payment_method="paypal"
            ),
        ]
        db.add_all(profiles)
        db.commit()

        # 3. Ten Demo Merchants
        merchants_data = [
            models.Merchant(id="merch-swiggy-01", business_name="Swiggy Gourmet", category="food", description="Instant doorstep food and cloud kitchens", logo_url="https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200&auto=format&fit=crop&q=60", commission_rate=4.5),
            models.Merchant(id="merch-zomato-02", business_name="Zomato Gold Meals", category="food", description="Handpicked dining and online meal ordering", logo_url="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=200&auto=format&fit=crop&q=60", commission_rate=4.0),
            models.Merchant(id="merch-uber-03", business_name="Uber Premier & Auto", category="taxi", description="Reliable daily commute and airport transfers", logo_url="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=200&auto=format&fit=crop&q=60", commission_rate=5.0),
            models.Merchant(id="merch-ola-04", business_name="Ola Cabs Express", category="taxi", description="City taxis, bike rentals and outstation trips", logo_url="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=200&auto=format&fit=crop&q=60", commission_rate=4.8),
            models.Merchant(id="merch-myntra-05", business_name="Myntra Fashion Hub", category="shopping", description="Curated trendy fashion and footwear", logo_url="https://images.unsplash.com/photo-1445205170230-053b83016050?w=200&auto=format&fit=crop&q=60", commission_rate=6.0),
            models.Merchant(id="merch-amazon-06", business_name="Amazon Pay Deals", category="shopping", description="Electronics, accessories and smart devices", logo_url="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=200&auto=format&fit=crop&q=60", commission_rate=5.5),
            models.Merchant(id="merch-blinkit-07", business_name="Blinkit Fresh Mart", category="groceries", description="10-minute grocery delivery and fresh vegetables", logo_url="https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&auto=format&fit=crop&q=60", commission_rate=3.8),
            models.Merchant(id="merch-zepto-08", business_name="Zepto SuperSaver", category="groceries", description="Daily kitchen essentials and bakery supplies", logo_url="https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=200&auto=format&fit=crop&q=60", commission_rate=3.5),
            models.Merchant(id="merch-bms-09", business_name="BookMyShow Cinema", category="entertainment", description="Cinemas, music festivals and standup shows", logo_url="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=200&auto=format&fit=crop&q=60", commission_rate=3.5),
            models.Merchant(id="merch-mmt-10", business_name="MakeMyTrip Escapes", category="travel", description="Flight bookings, boutique villas and holiday deals", logo_url="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=200&auto=format&fit=crop&q=60", commission_rate=7.0),
        ]
        db.add_all(merchants_data)
        db.commit()

        # 4. Over 20 Merchant Coupons
        expiry_base = datetime.utcnow() + timedelta(days=90)
        coupons = [
            # Food (4 coupons)
            models.Coupon(id="coup-swiggy-25", merchant_id="merch-swiggy-01", code="SWIGGYFEAST25", title="25% OFF on Swiggy Gourmet with PayPal", description="Get 25% discount up to ₹180 on eligible orders above ₹400 paid via PayPal.", category="food", discount_type="percentage", discount_value=25.0, min_order_amount=400.0, max_discount=180.0, expiry_date=expiry_base, usage_limit=1000, times_used=42),
            models.Coupon(id="coup-zomato-150", merchant_id="merch-zomato-02", code="ZOMATOPAYPAL150", title="Flat ₹150 OFF on Zomato Gold Dining", description="Flat ₹150 discount on premium restaurants with minimum billing of ₹600.", category="food", discount_type="fixed", discount_value=150.0, min_order_amount=600.0, max_discount=150.0, expiry_date=expiry_base, usage_limit=500, times_used=68),
            models.Coupon(id="coup-swiggy-night", merchant_id="merch-swiggy-01", code="LATEBITE20", title="20% Late Night Craving Discount", description="Save 20% on all orders placed between 10 PM and 3 AM.", category="food", discount_type="percentage", discount_value=20.0, min_order_amount=350.0, max_discount=120.0, expiry_date=expiry_base, usage_limit=300, times_used=19),
            models.Coupon(id="coup-zomato-biryani", merchant_id="merch-zomato-02", code="BIRYANI75", title="Flat ₹75 OFF on Weekend Meals", description="Enjoy ₹75 discount on authentic biryanis and party platters above ₹450.", category="food", discount_type="fixed", discount_value=75.0, min_order_amount=450.0, max_discount=75.0, expiry_date=expiry_base, usage_limit=450, times_used=35),

            # Taxi & Mobility (4 coupons)
            models.Coupon(id="coup-uber-30", merchant_id="merch-uber-03", code="UBERCOMMUTE30", title="30% OFF Daily Commute with PayPal", description="Save 30% up to ₹150 on your daily cab rides when checking out with PayPal.", category="taxi", discount_type="percentage", discount_value=30.0, min_order_amount=200.0, max_discount=150.0, expiry_date=expiry_base, usage_limit=800, times_used=115),
            models.Coupon(id="coup-ola-airport", merchant_id="merch-ola-04", code="OLAAIRPORT200", title="Flat ₹200 OFF on Airport & Rental Trips", description="Flat ₹200 instant deduction on Outstation or Airport Prime rides over ₹700.", category="taxi", discount_type="fixed", discount_value=200.0, min_order_amount=700.0, max_discount=200.0, expiry_date=expiry_base, usage_limit=400, times_used=54),
            models.Coupon(id="coup-uber-auto", merchant_id="merch-uber-03", code="UBERAUTO15", title="15% OFF Quick Metro Shuttle Auto", description="Save 15% on short city hops and daily station shuttles.", category="taxi", discount_type="percentage", discount_value=15.0, min_order_amount=100.0, max_discount=50.0, expiry_date=expiry_base, usage_limit=600, times_used=88),
            models.Coupon(id="coup-ola-weekend", merchant_id="merch-ola-04", code="OLAWEEKEND25", title="25% OFF Weekend City Exploration", description="Get 25% off up to ₹175 on all inter-city cab bookings.", category="taxi", discount_type="percentage", discount_value=25.0, min_order_amount=350.0, max_discount=175.0, expiry_date=expiry_base, usage_limit=350, times_used=22),

            # Shopping (4 coupons)
            models.Coupon(id="coup-myntra-35", merchant_id="merch-myntra-05", code="MYNTRASTYLE35", title="35% OFF on Fashion Season Clearance", description="Get 35% instant markdown up to ₹700 on premium brand wardrobe orders above ₹1,500.", category="shopping", discount_type="percentage", discount_value=35.0, min_order_amount=1500.0, max_discount=700.0, expiry_date=expiry_base, usage_limit=1500, times_used=230),
            models.Coupon(id="coup-amazon-500", merchant_id="merch-amazon-06", code="AMAZONGIZMO500", title="Flat ₹500 OFF on Gadgets & Electronics", description="Special PayPal reward: Flat ₹500 discount on smart gadgets above ₹2,500.", category="shopping", discount_type="fixed", discount_value=500.0, min_order_amount=2500.0, max_discount=500.0, expiry_date=expiry_base, usage_limit=450, times_used=112),
            models.Coupon(id="coup-myntra-footwear", merchant_id="merch-myntra-05", code="STEPUP20", title="20% OFF Sneakers & Sports Footwear", description="Get 20% discount on Nike, Puma and Adidas sports lines.", category="shopping", discount_type="percentage", discount_value=20.0, min_order_amount=1200.0, max_discount=400.0, expiry_date=expiry_base, usage_limit=700, times_used=79),
            models.Coupon(id="coup-amazon-fashion", merchant_id="merch-amazon-06", code="AMAZONLUXE250", title="Flat ₹250 OFF Luxury Beauty & Perfumes", description="Save ₹250 on premium fragrances and skincare above ₹1,200.", category="shopping", discount_type="fixed", discount_value=250.0, min_order_amount=1200.0, max_discount=250.0, expiry_date=expiry_base, usage_limit=500, times_used=48),

            # Groceries (3 coupons)
            models.Coupon(id="coup-blinkit-75", merchant_id="merch-blinkit-07", code="BLINKFAST75", title="Flat ₹75 OFF on Quick Groceries", description="Flat ₹75 savings on pantry and dairy supplies above ₹499.", category="groceries", discount_type="fixed", discount_value=75.0, min_order_amount=499.0, max_discount=75.0, expiry_date=expiry_base, usage_limit=1000, times_used=92),
            models.Coupon(id="coup-zepto-100", merchant_id="merch-zepto-08", code="ZEPTOESSENTIAL100", title="Flat ₹100 OFF Fresh Fruits & Organic Dairy", description="Get ₹100 instant markdown on fresh farm produce orders above ₹599.", category="groceries", discount_type="fixed", discount_value=100.0, min_order_amount=599.0, max_discount=100.0, expiry_date=expiry_base, usage_limit=800, times_used=64),
            models.Coupon(id="coup-blinkit-monthly", merchant_id="merch-blinkit-07", code="MONTHLYPANTRY15", title="15% OFF Monthly Supermarket Stockup", description="Save 15% up to ₹300 on bulk grain and household cleaning essentials.", category="groceries", discount_type="percentage", discount_value=15.0, min_order_amount=1200.0, max_discount=300.0, expiry_date=expiry_base, usage_limit=400, times_used=31),

            # Entertainment (3 coupons)
            models.Coupon(id="coup-bms-100", merchant_id="merch-bms-09", code="CINEMAFUN100", title="Flat ₹100 OFF Movie & Concert Tickets", description="Flat ₹100 discount on 2 or more tickets booked with PayPal.", category="entertainment", discount_type="fixed", discount_value=100.0, min_order_amount=400.0, max_discount=100.0, expiry_date=expiry_base, usage_limit=500, times_used=41),
            models.Coupon(id="coup-bms-imax", merchant_id="merch-bms-09", code="IMAXPASS20", title="20% OFF IMAX & 4DX Experience", description="Save 20% up to ₹250 on premium format screens.", category="entertainment", discount_type="percentage", discount_value=20.0, min_order_amount=700.0, max_discount=250.0, expiry_date=expiry_base, usage_limit=300, times_used=18),
            models.Coupon(id="coup-bms-standup", merchant_id="merch-bms-09", code="LAUGHTER150", title="Flat ₹150 OFF Live Comedy & Festivals", description="Flat ₹150 discount on comedy club passes above ₹800.", category="entertainment", discount_type="fixed", discount_value=150.0, min_order_amount=800.0, max_discount=150.0, expiry_date=expiry_base, usage_limit=250, times_used=14),

            # Travel (3 coupons)
            models.Coupon(id="coup-mmt-12", merchant_id="merch-mmt-10", code="FLYPAYPAL12", title="12% OFF Flights & Holiday Packages", description="Save up to ₹1,500 on all domestic airline bookings via PayPal.", category="travel", discount_type="percentage", discount_value=12.0, min_order_amount=3000.0, max_discount=1500.0, expiry_date=expiry_base, usage_limit=250, times_used=33),
            models.Coupon(id="coup-mmt-resort", merchant_id="merch-mmt-10", code="STAYESCAPE800", title="Flat ₹800 OFF Boutique Resort Stays", description="Instant ₹800 discount on 4-star and 5-star resort getaways above ₹4,000.", category="travel", discount_type="fixed", discount_value=800.0, min_order_amount=4000.0, max_discount=800.0, expiry_date=expiry_base, usage_limit=200, times_used=27),
            models.Coupon(id="coup-mmt-weekend", merchant_id="merch-mmt-10", code="WEEKENDTRIP15", title="15% OFF Roadtrips & Hillstation Stays", description="Get 15% discount up to ₹1,000 on weekend villa reservations.", category="travel", discount_type="percentage", discount_value=15.0, min_order_amount=2500.0, max_discount=1000.0, expiry_date=expiry_base, usage_limit=300, times_used=19),
        ]
        db.add_all(coupons)
        db.commit()

        # 5. Generate 30 Days of Transactions for each of the 5 Customers
        now = datetime.utcnow()
        tx_batch = []

        def generate_cohort_transactions(customer_id, category, target_total, merchants_list, count):
            base_amt = target_total / max(1, count)
            for i in range(count):
                day_offset = random.randint(1, 29)
                tx_time = now - timedelta(days=day_offset, hours=random.randint(1, 12), minutes=random.randint(0, 50))
                amt = round(base_amt * random.uniform(0.85, 1.15), 2)
                merch = random.choice(merchants_list)
                tx = models.Transaction(
                    customer_id=customer_id,
                    merchant_name=merch,
                    category=category,
                    amount=amt,
                    currency="INR",
                    payment_channel="paypal" if random.random() > 0.3 else "card",
                    timestamp=tx_time,
                    is_synthetic=True
                )
                tx_batch.append(tx)

        # Customer A: Food delivery ₹6,000 | Taxi ₹3,000 | Shopping ₹2,000
        generate_cohort_transactions("user-cust-a-001", "food", 6000.0, ["Swiggy Gourmet", "Zomato Gold", "FreshMenu", "EatSure"], 12)
        generate_cohort_transactions("user-cust-a-001", "taxi", 3000.0, ["Uber Premier", "Ola Cabs", "Rapido"], 8)
        generate_cohort_transactions("user-cust-a-001", "shopping", 2000.0, ["Amazon Pay Deals", "Flipkart", "Myntra"], 3)

        # Customer B: Food delivery ₹1,000 | Taxi ₹7,000 | Shopping ₹2,000
        generate_cohort_transactions("user-cust-b-002", "food", 1000.0, ["Swiggy Gourmet", "Zomato Gold"], 2)
        generate_cohort_transactions("user-cust-b-002", "taxi", 7000.0, ["Uber Premier", "Ola Cabs Express", "BluSmart"], 18)
        generate_cohort_transactions("user-cust-b-002", "shopping", 2000.0, ["Amazon Pay Deals", "Flipkart"], 3)

        # Customer C: Food delivery ₹1,500 | Taxi ₹1,000 | Shopping ₹8,000
        generate_cohort_transactions("user-cust-c-003", "food", 1500.0, ["Swiggy Gourmet", "Zomato Gold"], 3)
        generate_cohort_transactions("user-cust-c-003", "taxi", 1000.0, ["Uber Auto", "Ola Cabs"], 3)
        generate_cohort_transactions("user-cust-c-003", "shopping", 8000.0, ["Myntra Fashion Hub", "Ajio", "Amazon Luxe", "Nykaa"], 8)

        # Customer D: Groceries ₹6,500 | Shopping ₹1,500 | Food ₹1,200 | Taxi ₹800
        generate_cohort_transactions("user-cust-d-004", "groceries", 6500.0, ["Blinkit Fresh Mart", "Zepto SuperSaver", "Nature's Basket"], 14)
        generate_cohort_transactions("user-cust-d-004", "shopping", 1500.0, ["Amazon Pay Deals", "BigBazaar"], 3)
        generate_cohort_transactions("user-cust-d-004", "food", 1200.0, ["Swiggy Gourmet"], 3)
        generate_cohort_transactions("user-cust-d-004", "taxi", 800.0, ["Uber Auto"], 3)

        # Customer E: Travel & Ent ₹7,500 | Food ₹1,500 | Taxi ₹1,200 | Shopping ₹1,000
        generate_cohort_transactions("user-cust-e-005", "travel", 5000.0, ["MakeMyTrip Escapes", "IndiGo Airlines"], 2)
        generate_cohort_transactions("user-cust-e-005", "entertainment", 2500.0, ["BookMyShow Cinema", "PVR INOX"], 4)
        generate_cohort_transactions("user-cust-e-005", "food", 1500.0, ["Zomato Gold Meals", "Hard Rock Cafe"], 3)
        generate_cohort_transactions("user-cust-e-005", "taxi", 1200.0, ["Uber Premier", "Ola Airport"], 3)
        generate_cohort_transactions("user-cust-e-005", "shopping", 1000.0, ["Decathlon Sports"], 2)

        db.add_all(tx_batch)
        db.commit()

        # 6. Customer Savings Baseline
        savings_records = [
            models.CustomerSavings(customer_id="user-cust-a-001", category="food", total_saved=450.0, redemption_count=3),
            models.CustomerSavings(customer_id="user-cust-a-001", category="taxi", total_saved=120.0, redemption_count=1),
            models.CustomerSavings(customer_id="user-cust-b-002", category="taxi", total_saved=620.0, redemption_count=4),
            models.CustomerSavings(customer_id="user-cust-b-002", category="food", total_saved=80.0, redemption_count=1),
            models.CustomerSavings(customer_id="user-cust-c-003", category="shopping", total_saved=850.0, redemption_count=3),
            models.CustomerSavings(customer_id="user-cust-c-003", category="entertainment", total_saved=100.0, redemption_count=1),
            models.CustomerSavings(customer_id="user-cust-d-004", category="groceries", total_saved=380.0, redemption_count=4),
            models.CustomerSavings(customer_id="user-cust-e-005", category="travel", total_saved=950.0, redemption_count=2),
        ]
        db.add_all(savings_records)
        db.commit()

        print(f"Database successfully populated with {len(tx_batch)} transactions across 5 cohorts, 10 merchants, and {len(coupons)} coupons!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
