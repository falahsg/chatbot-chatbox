from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
from flask_mail import Mail, Message
from chat import get_response

app = Flask(__name__)
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 465
app.config['MAIL_USE_TLS'] = False
app.config['MAIL_USE_SSL'] = True
app.config['MAIL_USERNAME'] = 'phising1803@gmail.com'
app.config['MAIL_PASSWORD'] = 'txbx kmtw hgax olcc'
mail = Mail(app)
CORS(app)

@app.get("/")
def index_get():
    # Daftar pertanyaan yang ingin ditampilkan
    questions = [
        "Apa itu Kampus Merdeka?",
        "Kenapa harus ikut Kampus Merdeka?"
    ]
    return render_template("base.html", questions=questions)

@app.post("/predict")
def predict():
    text = request.get_json().get("message")
    response = get_response(text)
    message = {"answer": response}
    return jsonify(message)

@app.post("/kontak_admin")
def kontak_admin():
    try:
        nama = request.form['nama']
        email = request.form['email']
        pertanyaan = request.form['pertanyaan']

        msg = Message('Pertanyaan dari Pengguna', sender='phising1803@gmail.com', recipients=['phising1803@gmail.com'])
        msg.body = f'Nama: {nama}\nEmail: {email}\nPertanyaan: {pertanyaan}'

        mail.send(msg)

        # Redirect ke halaman sukses setelah berhasil
        return render_template("success.html")  # Mengarahkan ke halaman success

    except Exception as e:
        return str(e), 500

if __name__ == "__main__":
    app.run(debug=True)