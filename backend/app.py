from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
from config import Config
from models import mysql, init_db, db_connection, token_required
import bcrypt
import jwt
import datetime

app = Flask(__name__)
CORS(app)
app.config.from_object(Config)
init_db(app)

# Auth Routes
@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data['username']
    email = data['email']
    password = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt())
    
    cursor = db_connection()
    try:
        cursor.execute("INSERT INTO users (username, email, password) VALUES (%s, %s, %s)", 
                      (username, email, password))
        mysql.connection.commit()
        return jsonify({'message': 'User registered successfully'}), 201
    except Exception as e:
        return jsonify({'message': str(e)}), 400

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data['username']
    password = data['password']
    
    cursor = db_connection()
    cursor.execute("SELECT * FROM users WHERE username = %s", (username,))
    user = cursor.fetchone()
    
    if user and bcrypt.checkpw(password.encode('utf-8'), user['password'].encode('utf-8')):
        token = jwt.encode({
            'user_id': user['id'],
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
        }, app.config['SECRET_KEY'])
        
        return jsonify({'token': token, 'user_id': user['id']})
    
    return jsonify({'message': 'Invalid credentials'}), 401

# Tasks Routes
@app.route('/tasks', methods=['GET'])
@token_required
def get_tasks(current_user):
    cursor = db_connection()
    cursor.execute("""
        SELECT t.*, c.name as category_name 
        FROM tasks t 
        LEFT JOIN categories c ON t.category_id = c.id 
        WHERE t.user_id = %s
    """, (current_user['id'],))
    tasks = cursor.fetchall()
    return jsonify(tasks)

@app.route('/tasks', methods=['POST'])
@token_required
def add_task(current_user):
    data = request.get_json()
    cursor = db_connection()
    cursor.execute("""
        INSERT INTO tasks 
        (user_id, category_id, title, description, deadline, status) 
        VALUES (%s, %s, %s, %s, %s, %s)
    """, (
        current_user['id'],
        data.get('category_id'),
        data['title'],
        data.get('description', ''),
        data.get('deadline'),
        data.get('status', 'pending')
    ))
    mysql.connection.commit()
    return jsonify({'message': 'Task added successfully'}), 201

@app.route('/tasks/<int:task_id>', methods=['PUT'])
@token_required
def update_task(current_user, task_id):
    data = request.get_json()
    cursor = db_connection()
    cursor.execute("""
        UPDATE tasks SET 
        title = %s, 
        description = %s, 
        category_id = %s, 
        deadline = %s, 
        status = %s 
        WHERE id = %s AND user_id = %s
    """, (
        data['title'],
        data.get('description', ''),
        data.get('category_id'),
        data.get('deadline'),
        data.get('status', 'pending'),
        task_id,
        current_user['id']
    ))
    mysql.connection.commit()
    return jsonify({'message': 'Task updated successfully'})

@app.route('/tasks/<int:task_id>', methods=['DELETE'])
@token_required
def delete_task(current_user, task_id):
    cursor = db_connection()
    cursor.execute("DELETE FROM tasks WHERE id = %s AND user_id = %s", (task_id, current_user['id']))
    mysql.connection.commit()
    return jsonify({'message': 'Task deleted successfully'})

# Categories Routes
@app.route('/categories', methods=['GET'])
@token_required
def get_categories(current_user):
    cursor = db_connection()
    cursor.execute("SELECT * FROM categories")
    categories = cursor.fetchall()
    return jsonify(categories)

# Resources Routes
@app.route('/resources', methods=['GET'])
@token_required
def get_resources(current_user):
    cursor = db_connection()
    cursor.execute("SELECT * FROM resources WHERE user_id = %s", (current_user['id'],))
    resources = cursor.fetchall()
    return jsonify(resources)

@app.route('/resources', methods=['POST'])
@token_required
def add_resource(current_user):
    data = request.get_json()
    cursor = db_connection()
    cursor.execute("""
        INSERT INTO resources 
        (user_id, title, type, url, notes) 
        VALUES (%s, %s, %s, %s, %s)
    """, (
        current_user['id'],
        data['title'],
        data['type'],
        data['url'],
        data.get('notes', '')
    ))
    mysql.connection.commit()
    return jsonify({'message': 'Resource added successfully'}), 201

# Sessions Routes
@app.route('/sessions', methods=['GET'])
@token_required
def get_sessions(current_user):
    cursor = db_connection()
    cursor.execute("""
        SELECT s.*, t.title as task_title 
        FROM sessions s 
        LEFT JOIN tasks t ON s.task_id = t.id 
        WHERE s.user_id = %s
    """, (current_user['id'],))
    sessions = cursor.fetchall()
    return jsonify(sessions)

@app.route('/sessions', methods=['POST'])
@token_required
def add_session(current_user):
    data = request.get_json()
    cursor = db_connection()
    cursor.execute("""
        INSERT INTO sessions 
        (user_id, task_id, session_date, start_time, end_time, duration_minutes, notes) 
        VALUES (%s, %s, %s, %s, %s, %s, %s)
    """, (
        current_user['id'],
        data.get('task_id'),
        data['session_date'],
        data['start_time'],
        data['end_time'],
        data['duration_minutes'],
        data.get('notes', '')
    ))
    mysql.connection.commit()
    return jsonify({'message': 'Session added successfully'}), 201

# Notes Routes
@app.route('/notes', methods=['GET'])
@token_required
def get_notes(current_user):
    cursor = db_connection()
    cursor.execute("SELECT * FROM notes WHERE user_id = %s", (current_user['id'],))
    notes = cursor.fetchall()
    return jsonify(notes)

@app.route('/notes', methods=['POST'])
@token_required
def add_note(current_user):
    data = request.get_json()
    cursor = db_connection()
    cursor.execute("""
        INSERT INTO notes 
        (user_id, title, content) 
        VALUES (%s, %s, %s)
    """, (
        current_user['id'],
        data['title'],
        data['content']
    ))
    mysql.connection.commit()
    return jsonify({'message': 'Note added successfully'}), 201

# Achievements Routes
@app.route('/achievements', methods=['GET'])
@token_required
def get_achievements(current_user):
    cursor = db_connection()
    cursor.execute("SELECT * FROM achievements WHERE user_id = %s", (current_user['id'],))
    achievements = cursor.fetchall()
    return jsonify(achievements)

@app.route('/achievements', methods=['POST'])
@token_required
def add_achievement(current_user):
    data = request.get_json()
    cursor = db_connection()
    cursor.execute("""
        INSERT INTO achievements 
        (user_id, title, description, achieved_on) 
        VALUES (%s, %s, %s, %s)
    """, (
        current_user['id'],
        data['title'],
        data['description'],
        data['achieved_on']
    ))
    mysql.connection.commit()
    return jsonify({'message': 'Achievement added successfully'}), 201

# Logs Routes
@app.route('/logs', methods=['GET'])
@token_required
def get_logs(current_user):
    cursor = db_connection()
    cursor.execute("SELECT * FROM logs WHERE user_id = %s", (current_user['id'],))
    logs = cursor.fetchall()
    return jsonify(logs)

@app.route('/logs', methods=['POST'])
@token_required
def add_log(current_user):
    data = request.get_json()
    cursor = db_connection()
    cursor.execute("""
        INSERT INTO logs 
        (user_id, log_date, summary, mood) 
        VALUES (%s, %s, %s, %s)
    """, (
        current_user['id'],
        data['log_date'],
        data['summary'],
        data['mood']
    ))
    mysql.connection.commit()
    return jsonify({'message': 'Log added successfully'}), 201

if __name__ == '__main__':
    app.run(debug=True)