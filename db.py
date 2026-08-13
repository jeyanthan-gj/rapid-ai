import os
from supabase import create_client, Client

# Supabase configuration
SUPABASE_URL = "https://jlfcaprbbezqdaesbaus.supabase.co"
SUPABASE_KEY = "sb_publishable_ybaeAGXrikyxj-7ieX8tQw_7CGdQKCd"

def get_supabase_client() -> Client:
    """Initialize and return the Supabase client."""
    return create_client(SUPABASE_URL, SUPABASE_KEY)

if __name__ == "__main__":
    # Test connection
    try:
        supabase = get_supabase_client()
        response = supabase.table("employees").select("*").limit(1).execute()
        print("Connection successful!")
        print(f"Retrieved {len(response.data)} records.")
    except Exception as e:
        print(f"Connection failed: {e}")
