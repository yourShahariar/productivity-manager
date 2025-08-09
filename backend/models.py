from flask_mysqldb import MySQL
from flask import current_app
import jwt
import datetime
from functools import wraps

mysql = MySQL()

def init_db(app):
    mysql.init_app(app)

def db_connection():
    return mysql.connection.cursor()

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        if 'x-access-token' in request.headers:
            token = request.headers['x-access-token']
        
        if not token:
            return {'message': 'Token is missing!'}, 401
            
        try:
            data = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
            cursor = db_connection()
            cursor.execute("SELECT * FROM users WHERE id = %s", (data['user_id'],))
            current_user = cursor.fetchone()
        except:
            return {'message': 'Token is invalid!'}, 401
            
        return f(current_user, *args, **kwargs)
        
    return decorated