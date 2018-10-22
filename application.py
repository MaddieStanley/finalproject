import os
import re
import requests
import json
import string
import random

from cs50 import SQL
from flask import Flask, jsonify, flash, redirect, render_template, request, session, url_for
from flask_session import Session
from tempfile import mkdtemp
from werkzeug.exceptions import default_exceptions
from werkzeug.security import check_password_hash, generate_password_hash

from helpers import apology, login_required

# Configure application
app = Flask(__name__)

# Ensure templates are auto-reloaded
app.config["TEMPLATES_AUTO_RELOAD"] = True

# Ensure responses aren't cached


@app.after_request
def after_request(response):
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Expires"] = 0
    response.headers["Pragma"] = "no-cache"
    return response


# Configure session to use filesystem (instead of signed cookies)
app.config["SESSION_FILE_DIR"] = mkdtemp()
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)

# Configure CS50 Library to use SQLite database
db = SQL("sqlite:///project.db")

# API information for oxford dictionaries
app_id = '657e2e61'
app_key = '165c5bed5770d3d7aa9f56ea3244be70'

# Dictionary language
language = 'en'

# START of url for word requests
url = 'https://od-api.oxforddictionaries.com:443/api/v1/wordlist/' + language + '/regions=British'

# global variables
punctuation = set(string.punctuation)
tempDict = []


@app.route("/", methods=["GET", "POST"])
def index():
    if request.method == "POST":

        wordLength = int(request.form.get("wordLength"))
        wordNumber = int(request.form.get("wordNumber"))
        category = request.form.get("category")

        # wordLength = 5
        # wordNumber = 3
        return render_template("play.html", wordLength=wordLength, wordNumber=wordNumber, category=category, method="newGame", words={'words': None})

    else:

        """Render index"""
        return render_template("index.html")


@app.route("/play")
def play():

    # retrieve wordNumber random words from dictionary with correct length
    # tempDict = db.execute("SELECT word FROM dictionary WHERE length = :wordLength ORDER BY random() LIMIT :wordNumber",
    #                        wordNumber=request.args.get("wordNumber"), wordLength=request.args.get("wordLength"))

    method = request.args.get("method")
    wordLength = request.args.get("wordLength")
    wordNumber = request.args.get("wordNumber")

    global tempDict

    tempDict = []
    baseWords = []

    if method == "newGame":

        category = request.args.get("category")

        r = requests.get((url + ';domains=' + category + '?word_length=' + str(wordLength)),
                         headers={'app_id': app_id, 'app_key': app_key})

#    x = json.dumps(r.json())

        results = r.json()

        results = results['results']

#    print(results)

        # remove all entries containing punctuation
        for entry in results:
            word = entry.get('id')
            if not any(char in punctuation for char in word):
                tempDict.append(entry)

    baseWords = random.sample(tempDict, int(wordNumber))
#    wordLength = 5
#    wordNumber = 3

#    baseWords = [{'word': 'hello'}, {'word': 'mummy'}, {'word': 'sunny'}]

#    listOfCharacters = [set() for _ in range(wordLength)]

#    for entry in baseWords:
#        word = entry.get('word')
#        for i in range(wordLength):
#            listOfCharacters[i].add(word[i])

#    maxHeight = 0

#    for place in listOfCharacters:
#        if len(place) > maxHeight:
#            maxHeight = len(place)

#    columnHeight = (maxHeight * 2) - 1

    # create a list containing lists of spaces
#    formattedColumns = [[u'\xa0']*columnHeight for _ in range(wordLength)]

#    counter = 0

#    for place in listOfCharacters:
#        if len(place) == 2:
#            formattedColumns[counter][(maxHeight - len(place) ):(maxHeight)] = place
#        else:
#            formattedColumns[counter][(maxHeight + 1 - len(place) ):(maxHeight + 1)] = place
#        counter += 1

#    print(formattedColumns)

    # return characters
    return jsonify(baseWords)


@app.route("/match")
def match():

    # get q from html
    query = request.args.get("q")

    # see if current selection matches a word
    for entry in tempDict:
        if entry.get("word") == query:
            print("word match")
            return jsonify(entry)

    return jsonify({'word': ''})


@app.route("/myCreations")
@login_required
def myCreations():

    return redirect("/create")


@app.route("/explore")
def explore():
    return render_template("explore.html")


@app.route("/create", methods=["GET", "POST"])
@login_required
def create():

    if request.method == "POST":

        wordNumber = int(request.form.get("wordNumber"))
        word1 = request.form.get("word1")
        word2 = request.form.get("word2")
        word3 = request.form.get("word3")

        # Ensure username was submitted
        if not word1 or not word2 or not word3:
            flash("Please provide a word for each text box.")
            return redirect("/create")

        if not (len(word1) == len(word2)) or not (len(word1) == len(word3)):
            flash("Words must be the same length")
            return redirect("/create")

        if not (3 < len(word1) < 8):
            flash("Words must be between 4 and 7 letters long")
            return redirect("/create")

        words = [{"word": word1}, {"word": word2}, {"word": word3}]

        if wordNumber >= 4:

            word4 = request.form.get("word4")

            if not word4:
                flash("Please provide a word for each text box.")
                return redirect("/create")

            if not len(word1) == len(word4):
                flash("Words must be the same length")
                return redirect("/create")

            words.append({"word": word4})

        if wordNumber >= 5:

            word5 = request.form.get("word5")

            if not word5:
                flash("Please provide a word for each text box.")
                return redirect("/create")

            if not len(word1) == len(word5):
                flash("Words must be the same length")
                return redirect("/create")

            words.append({"word": word5})

        if wordNumber >= 6:

            word6 = request.form.get("word6")

            if not word6:
                flash("Please provide a word for each text box.")
                return redirect("/create")

            if not len(word1) == len(word6):
                flash("Words must be the same length")
                return redirect("/create")

            words.append({"word": word6})

        print(word1, type(word1))
        print(words)

        # check form is filled in properly
        # get words from form
        # store words in database
        # redirect to game board
        # flash ("your puzzle has been saved")
        return render_template("play.html", method="create", wordLength=len(word1), wordNumber=wordNumber, words=words)

    else:
        # if no-one is logged in redirect to login page
            # send alert saying "you must be logged in to create puzzles!"
        # else

        return render_template("create.html")


@app.route("/login", methods=["GET", "POST"])
def login():
    """Log user in"""

    # User reached route via POST (as by submitting a form via POST)
    if request.method == "POST":

        # Forget any user_id
        session.clear()

        # Query database for username
        rows = db.execute("SELECT * FROM users WHERE username = :username",
                          username=request.form.get("username"))

        # Ensure username exists and password is correct
        if len(rows) != 1 or not check_password_hash(rows[0]["hash"], request.form.get("password")):
            session['error'] = 'true'
            flash("Invalid username or password!")
            return redirect("/login")

        # Remember which user has logged in
        session["user_id"] = rows[0]["id"]

        # Redirect user to home page
        return redirect("/")

    # User reached route via GET (as by clicking a link or via redirect)
    else:
        return render_template("login.html")


@app.route("/logout")
def logout():
    """Log user out"""

    # Forget any user_id
    session.clear()

    # Redirect user to login form
    return redirect("/")


@app.route("/register", methods=["GET", "POST"])
def register():
    """Register user"""

    # User reached route via POST (as by submitting a form via POST)
    if request.method == "POST":

        # Forget any user_id
        session.clear()

        # Ensure username was submitted
#        if not request.form.get("username"):
#            return redirect("/register")

        # Ensure password was submitted
#        elif not request.form.get("password"):
#            return redirect("/register")

        # Ensure confirmation was submitted
#        elif not request.form.get("confirmation"):
#            return redirect("/register")

        # Ensure passwords match
        if not request.form.get("password") == request.form.get("confirmation"):
            session['error'] = 'true'
            flash('Passwords must match.')
            return redirect("/register")

        else:

            # Hash password
            hash = generate_password_hash(request.form.get("password"))

            # input username into database
            result = db.execute("INSERT INTO users (username, hash) VALUES (:username, :hash)",
                                username=request.form.get("username"), hash=hash)
            if not result:
                session['error'] = 'true'
                flash('Username is not available')
                return redirect("/register")

            else:
                # Query database for username
                rows = db.execute("SELECT * FROM users WHERE username = :username",
                                  username=request.form.get("username"))

                # Remember which user has logged in
                session["user_id"] = rows[0]["id"]

                # Redirect user to home page
                return redirect("/")

    # User reached route via GET (as by clicking a link or via redirect)
    else:

        return render_template("register.html")


@app.route("/define")
def define():

    # get q from html
    query = request.args.get("q")

    entriesUrl = "https://od-api.oxforddictionaries.com:443/api/v1/entries/en/"
    r = requests.get((entriesUrl + query + '/definitions%3B%20regions%3Dgb'), headers={'app_id': app_id, 'app_key': app_key})

    if r.status_code == 404 or r.status_code == 500:
        return jsonify({'error': r.status_code})

    response = r.json()
    results = response['results']
    entry = results[0]['lexicalEntries']

    return jsonify(entry)