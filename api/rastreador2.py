from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import openai
from bs4 import BeautifulSoup
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"*": {"origins": "*"}})


def get_page_text(url):
    response = requests.get(url)
    soup = BeautifulSoup(response.text, "lxml")
    main_content = soup.find_all('p')
    page_text = ' '.join([p.get_text() for p in main_content])
    clean_text = " ".join(page_text.split())
    return clean_text


def split_text_into_segments(text, max_tokens=3500):
    words = text.split()
    segments = []
    current_segment = []

    for word in words:
        if len(" ".join(current_segment) + word) < max_tokens:
            current_segment.append(word)
        else:
            segments.append(" ".join(current_segment))
            current_segment = [word]

    if current_segment:
        segments.append(" ".join(current_segment))

    return segments


def generate_summary(text_segments):
    openai.api_key = os.environ.get("API_KEY")
    summaries = []

    for text in text_segments:
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {
                        "role": "assistant",
                        "content": f"Resumir el siguiente texto y devolver el resultado siempre traducido al español:\n\n{text}\n\nResumen:"
                    }
                ],
                max_tokens=150,
            )
            summaries.append(response.choices[0].message.content.strip())

    return " ".join(summaries)


@app.route('/summarize', methods=['POST'])
def summarize():
    url = request.json['url']

    try:
        text = get_page_text(url)
        text_segments = split_text_into_segments(text)
        summary = generate_summary(text_segments)
        return jsonify({'summary': summary, 'status_code': 200})
    except Exception as e:
        return jsonify({'error': str(e), 'status_code': 500})


if __name__ == "__main__":
    app.run(debug=True)
