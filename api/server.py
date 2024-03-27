import json
import nltk
import random
import numpy as np
import re
import text2emotion as te
from flask import Flask, request, jsonify
import lyricsgenius as lg
from transformers import pipeline, AutoTokenizer
from collections import Counter



app = Flask(__name__)
GENIUS_TOKEN = "RmqzRDIjZsjodA0qhEabtz9ceKZV2G4010GeJoXASUJWk-2FDjVkzcOi2Bly0LR3"
nltk.download('omw-1.4')

@app.route("/sort", methods=['POST'])
def sort():
    # Load genres count dict from post request
    genresCountDict = json.loads(request.get_data())

    # Sort genres count dict
    genresCountDict = sorted(genresCountDict.items(), key=lambda kv: kv[1], reverse=True)[:5]

    # Split genre and count
    pureGenresCount = [x[1] for x in genresCountDict]
    genresList = [x[0] for x in genresCountDict]

    # Calculate percent of each genre to total count of all genres
    genreCountSum = 0
    genresPercentList = {}
    for count in pureGenresCount:
        genreCountSum += count
    for i in range(len(pureGenresCount)):
        genreCountPercent = pureGenresCount[i] / genreCountSum
        genresPercentList[genresList[i]] = (round(genreCountPercent * 100, 3))

    genreNames = list(genresPercentList.keys())
    genrePercents = list(genresPercentList.values())

    genreNames = np.array(genreNames)
    genrePercents = np.array(genrePercents)

    print(genrePercents)

    return {"genreNames": genreNames.tolist(), "genrePercents": genrePercents.tolist()}

@app.route("/lyrics", methods=['POST'])
def lyrics():
    tokenizer = AutoTokenizer.from_pretrained("arpanghoshal/EmoRoBERTa")
    emotion = pipeline('sentiment-analysis', model='arpanghoshal/EmoRoBERTa')

    def get_emotion_label(text):
        return (emotion(text)[0]['label'], emotion(text)[0]['score'] )


    # Load genres count dict from post request
    songsDict = json.loads(request.get_data())
    artists = list(songsDict.keys())
    genius = lg.Genius(GENIUS_TOKEN, retries=5)
    emotionDict = {
        'love': 0,
        'admiration': 0,
        'joy': 0,
        'approval': 0,
        'caring': 0,
        'excitement': 0,
        'amusement': 0,
        'gratitude': 0,
        'desire': 0,
        'anger': 0,
        'optimism': 0,
        'disapproval': 0,
        'grief': 0,
        'annoyance': 0,
        'pride': 0,
        'curiosity': 0,
        'neutral': 0,
        'disgust': 0,
        'disappointment': 0,
        'realization': 0,
        'fear': 0,
        'relief': 0,
        'confusion': 0,
        'remorse': 0,
        'embarrassment': 0,
        'surprise': 0,
        'sadness': 0,
        'nervousness': 0
    }

    for artist in artists:
        for song in songsDict[artist]:
            songResult = genius.search_song(title=song, artist=artist)
            if songResult == None:
                songResult = genius.search_song(title=song)
            if songResult != None:
                lyrics = songResult.lyrics
                lyrics = re.sub("[\(\[].*?[\)\]]", "", lyrics)
                lyrics = lyrics[lyrics.find('Lyrics') + 6:]
                label, score = get_emotion_label(lyrics[:450])
                score = round(score, 3)
                emotionDict[label] += score

    emotionDict['neutral'] = 0
    k = Counter(emotionDict)
    topThree = k.most_common(10)
    print(topThree)
    return jsonify(topThree)


@app.route("/quote", methods=['POST'])
def quote():
    
    # Load genres count dict from post request
    quoteList = []
    songsDict = json.loads(request.get_data())
    artists = list(songsDict.keys())
    genius = lg.Genius(GENIUS_TOKEN, retries=5)
    for i in range(0,5):
        artist = artists[i]
        song = genius.search_song(title=songsDict[artist][0], artist=artist)
        if song == None:
            song = genius.search_song(title=songsDict[artist][0])
        if song != None:
            lyrics = song.lyrics
            lyrics = re.sub("[\(\[].*?[\)\]]", "", lyrics)
            lyrics = lyrics[lyrics.find('Lyrics') + 6:]
            s = remove_see_live_ad(lyrics)
            s = until_embded(s)
            s = s.splitlines()
            while("" in s):
                s.remove("")
            rand = random.randint(0,len(s)-1)
            quote = s[rand] + " - " + artist
            quoteList.append(quote)
    return jsonify(quoteList)








# STRING STUFF

def until_embded(s, case_insensitive=False, use_regex=True):
    if use_regex:
        pattern = f"\d\dEmbed|\dEmbed|Embed\d|Embed\d\d"
        found = re.findall(pattern, s,  flags=re.IGNORECASE)
        print(found)
        for f in found:
            print("found")
            s = s.replace(f, '')
        return s
    else:
        s = keep_until(s, 'Embed', case_insensitive=case_insensitive)
        # NOTE: could be Embed1, Embed27, etc
        if s != '':
            while s[-1].isnumeric():
                s = s[:-1]
        return s
    return s

def remove_see_live_ad(s, include_word_boundaries=True):
    pattern = r"See .+ like" if include_word_boundaries else r"See .+ like"
    ads = re.findall(pattern, s,  flags=re.IGNORECASE)
    for ad in ads:
        s = s.replace(ad, '')
    return s

if __name__ == "__main__":
    app.run(debug=True)