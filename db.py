import os

from supabase import Client, create_client


SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")


def get_supabase_client() -> Client:
    """Initialize and return the Supabase client from environment variables."""
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise RuntimeError(
            "Missing Supabase configuration. Set SUPABASE_URL and SUPABASE_KEY."
        )
    return create_client(SUPABASE_URL, SUPABASE_KEY)


if __name__ == "__main__":
    try:
        supabase = get_supabase_client()
        response = supabase.table("employees").select("id").limit(1).execute()
        print("Connection successful!")
        print(f"Retrieved {len(response.data)} records.")
    except Exception as exc:
        print(f"Connection failed: {exc}")
