import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.getenv('IWishINeverExistedInThisShittyWorldEverydayIAmDyingFromInside', 'IWishINeverExistedInThisShittyWorldEverydayIAmDyingFromInside')
    MYSQL_HOST = os.getenv('yourShahariar.mysql.pythonanywhere-services.com', 'localhost')
    MYSQL_USER = os.getenv('yourShahariar', 'root')
    MYSQL_PASSWORD = os.getenv('Aaajkiraat12#', '')
    MYSQL_DB = os.getenv('yourShahariar$productivity_manager', 'productivity_manager')
    MYSQL_CURSORCLASS = 'DictCursor'
