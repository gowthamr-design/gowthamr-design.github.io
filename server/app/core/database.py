from sqlalchemy import create_engine, text, inspect
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings

engine = create_engine(
    settings.SQLALCHEMY_DATABASE_URI,
    pool_pre_ping=True,
    pool_recycle=3600,
    echo=False
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def sync_database_schema(bind_engine=engine):
    Base.metadata.create_all(bind=bind_engine)
    try:
        inspector = inspect(bind_engine)
        table_names = inspector.get_table_names()
        with bind_engine.connect() as conn:
            if "users" in table_names:
                cols = [c["name"] for c in inspector.get_columns("users")]
                if "is_active" not in cols:
                    conn.execute(text("ALTER TABLE users ADD COLUMN is_active INT NOT NULL DEFAULT 1"))
                    conn.commit()
                if "role" not in cols:
                    conn.execute(text("ALTER TABLE users ADD COLUMN role VARCHAR(50) NOT NULL DEFAULT 'USER'"))
                    conn.commit()
                else:
                    try:
                        conn.execute(text("ALTER TABLE users MODIFY COLUMN role VARCHAR(50) NOT NULL DEFAULT 'USER'"))
                        conn.commit()
                    except Exception:
                        pass
                if "created_at" not in cols:
                    conn.execute(text("ALTER TABLE users ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP"))
                    conn.commit()
                if "updated_at" not in cols:
                    conn.execute(text("ALTER TABLE users ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"))
                    conn.commit()

            if "services" in table_names:
                cols = [c["name"] for c in inspector.get_columns("services")]
                if "is_published" not in cols:
                    conn.execute(text("ALTER TABLE services ADD COLUMN is_published INT NOT NULL DEFAULT 1"))
                    conn.commit()
                if "display_order" not in cols:
                    conn.execute(text("ALTER TABLE services ADD COLUMN display_order INT NOT NULL DEFAULT 0"))
                    conn.commit()
                if "starting_price" not in cols:
                    conn.execute(text("ALTER TABLE services ADD COLUMN starting_price DECIMAL(12, 2) DEFAULT 0.00"))
                    conn.commit()
                if "price_unit" not in cols:
                    conn.execute(text("ALTER TABLE services ADD COLUMN price_unit VARCHAR(50) DEFAULT 'flat'"))
                    conn.commit()
                if "created_at" not in cols:
                    conn.execute(text("ALTER TABLE services ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP"))
                    conn.commit()
                if "updated_at" not in cols:
                    conn.execute(text("ALTER TABLE services ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"))
                    conn.commit()

            if "packages" in table_names:
                cols = [c["name"] for c in inspector.get_columns("packages")]
                if "is_published" not in cols:
                    conn.execute(text("ALTER TABLE packages ADD COLUMN is_published INT NOT NULL DEFAULT 1"))
                    conn.commit()
                if "display_order" not in cols:
                    conn.execute(text("ALTER TABLE packages ADD COLUMN display_order INT NOT NULL DEFAULT 0"))
                    conn.commit()
                if "tier_slug" not in cols:
                    conn.execute(text("ALTER TABLE packages ADD COLUMN tier_slug VARCHAR(50) DEFAULT 'custom'"))
                    conn.commit()
                if "badge_text" not in cols:
                    conn.execute(text("ALTER TABLE packages ADD COLUMN badge_text VARCHAR(50) DEFAULT 'Popular'"))
                    conn.commit()
                if "starting_price" not in cols:
                    conn.execute(text("ALTER TABLE packages ADD COLUMN starting_price DECIMAL(12, 2) DEFAULT 0.00"))
                    conn.commit()
                if "created_at" not in cols:
                    conn.execute(text("ALTER TABLE packages ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP"))
                    conn.commit()
                if "updated_at" not in cols:
                    conn.execute(text("ALTER TABLE packages ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"))
                    conn.commit()
    except Exception as e:
        print(f"Warning during schema synchronization: {e}")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

