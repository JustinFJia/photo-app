from flask import Flask, render_template
import json
import fake_data    # see fake_data.py file

app = Flask(__name__)

@app.route('/')
def home():
    current_user = fake_data.generate_user()
    posts=fake_data.generate_posts(n=8)

    return render_template(
        'index.html', 
        user=current_user,
        posts=posts,
        stories=fake_data.generate_stories(n=6),
        suggestions=fake_data.generate_suggestions(n=7)
    )

def check_comments_one_post(post):
    has_comments = False
    if len(post['comments']) > 0:
        has_comments = True
    return has_comments


#####################################
# Just to get you thinking about    #
# how to build a REST API (for HW3) #
##################################### 
@app.route('/api/feed')
def get_feed():
    return json.dumps(fake_data.generate_posts(10))

@app.route('/api/stories')
def get_stories():
    return json.dumps(fake_data.generate_stories(5))

@app.route('/api/suggestions')
def get_suggestions():
    return json.dumps(fake_data.generate_suggestions(8))


#####################################
# Enables flask app to run using    #
# "python3 app.py" command.         #
# Or you can use "flask run"        #
##################################### 
if __name__ == '__main__':
    app.run()