from mongo_migrate.base_migrate import BaseMigration


class Migration(BaseMigration):
    def upgrade(self):
        """Create users collection with unique email index"""
        # Create unique index on email field
        self.db['users'].create_index('email', unique=True)
        
    def downgrade(self):
        """Drop users collection"""
        self.db['users'].drop()
        
    def comment(self):
        return 'Create users collection with unique email index for authentication'

