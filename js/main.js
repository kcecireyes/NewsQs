$(document).ready(function(){
    //implement autogrow of the textbox
    $('#searchbox').autogrow();

    $('#searchbox').blur(function(){
        $('#searchbox').focus();
        $('#searchbox').select();
    });
    //auto type, fade out, select cursor 
    autotype("Hallo.", 1500, 80);
    // autotype("It's election day! Ask me questions.", 1500, 80);
    //capturing the enter
    var query_type = "/state/NY";
    handleAnswer(answer, "none");
});

function handleAnswer(answer_func, answer_type) {
    $("#searchbox").keypress(function(e) {
        removeAnswer();
        if (e.which == "13"){
            answer_func($(this).val(), answer_type);                
            fadeAndFocus($(this).val(), 1500, 4, 3);
        }
    });
}

function autotype(txt, fadeTime, delay){
    txt= txt.split('');
    for ( i=0; i<txt.length;i++){   
        setTimeout(function(){        
            $('#searchbox').val( $('#searchbox').val() + txt.shift())
        }, delay * i)       
    }
    fadeAndFocus(txt, fadeTime, delay, 3);
}

function fadeAndFocus(txt, fadeTime, delay, addNum){
    setTimeout(function(){
        $('#searchbox').fadeOut(fadeTime);
    }, delay*(txt.length + addNum));

    setTimeout(function(){
        $('#searchbox').val('');
        $('#searchbox').fadeIn();
        $('#searchbox').focus();
        $('#searchbox').select();
    }, (delay*(txt.length + addNum)) + fadeTime);
}

function removeAnswer(){
    console.log("I'm in removeAnswer");
    $("#results").empty();
}

function entertext(answer) {
    $("#results").append("<h1>" + answer + "</h1>");
}

function answer(question, type) {
    console.log('went into answer')
    // FUNSIES DEMO
    if (question == "who's the prettiest?") { entertext("YOU ARE");};
    if (question == "who's the prettiest now?") { entertext("STILL YOU"); };
    if (type == "none") {        
        if (question.match(/^is\s\w*\swinning(\?)*$/)) {     
            var name = question.replace("is", "").replace("winning?", "");            
            getCandidateResults(name);
        };
        if (question.match(/^who's\swinning\sin\s\my\s(...)$/)) {        
            getUserState('presidential');
        }
        if (question.match(/^who's\srunning\sfor\s(\w*)(\?)*$/)) {
            console.log("matched");
            var position = question.replace("who's", "").replace("running for", "").replace("?","");
            console.log(position);
            if (position == "senate") {
                console.log("lol senate");
                getUserState('senate');
            }
            else if ((position == "congress") || (position == "representative")) {
                console.log("lol congress");
                getUserState('congress');
            }
        }
    }
}

function getUserState(question_type) {
    setTimeout(function(){autotype('What state do you live in?', 1500, 80)}, 2000);
    handleAnswer(answerState, question_type);
}

function answerState(answer, type) {    
    if (answer.match(/^\w\w$/)){
        if (type == "presidential") {
            getCandidateResultsByState(answer);
        }
        else if (type == "senate"){
            console.log("getCandidateResults by senate");
        }
        else if (type == "congress"){
            console.log("getCandidateResults by congress");
        }
    }
}
function getCandidateResultsByState(state){
    $.getJSON("http://ec2-184-73-124-192.compute-1.amazonaws.com/jsonp/results?callback=?", function(data) {
        console.log(data);

        var totalVotes = 0;
        for(k in data.state[state].race_code.PR.race_candidate_id){
            totalVotes += data.state[state].race_code.PR.race_candidate_id[k]['votes_total'];
        }

        var votesHash = {};
        console.log(totalVotes)
        for(k in data.state[state].race_code.PR.race_candidate_id){
            votesHash[data.state[state].race_code.PR.race_candidate_id[k]['name']] = data.state[state].race_code.PR.race_candidate_id[k]['votes_total'];
            entertext(data.state[state].race_code.PR.race_candidate_id[k]['name'] + ' :: ' 
                + ((data.state[state].race_code.PR.race_candidate_id[k]['votes_total']/totalVotes)*100).toFixed(2) + "%");
        }
        console.log(votesHash);
    });
}

function getCandidateResults(candidate_name) {
    candidate_name = candidate_name.replace(/ /g,'');

    $.getJSON("http://ec2-184-73-124-192.compute-1.amazonaws.com/jsonp/results?callback=?", function(data) {
        totalVotesHash = {}
        // console.log(data);
        for(key in data.state){
            for(k in data.state[key].race_code.PR.race_candidate_id){
                if(!totalVotesHash[data.state[key].race_code.PR.race_candidate_id[k]['name']]){
                    totalVotesHash[data.state[key].race_code.PR.race_candidate_id[k]['name']] = 0;
                }
                totalVotesHash[data.state[key].race_code.PR.race_candidate_id[k]['name']] += data.state[key].race_code.PR.race_candidate_id[k]['votes_total'];
            }
        }
        totalVoteNumber = 0;
        var maxVotes = 0;
        var maxKey;
        for(key in totalVotesHash){
            totalVoteNumber += totalVotesHash[key];
            if(totalVotesHash[key] > maxVotes){
                maxKey = key;
                maxVotes = totalVotesHash[key];
            }
        }
        console.log(totalVotesHash);
        console.log(candidate_name);

        if(totalVotesHash[candidate_name] == maxVotes){
            entertext(candidate_name + " is winning with " + ((totalVotesHash[candidate_name]/totalVoteNumber)*100).toFixed(2) + '% of the vote')
        }
        else if(totalVotesHash[candidate_name] < maxVotes){
            entertext(
                candidate_name + ' is losing with ' + ((totalVotesHash[candidate_name]/totalVoteNumber)*100).toFixed(2) + '% of the vote.' +
                maxKey + ' has ' + ((maxVotes/totalVoteNumber)*100).toFixed(2) + '% of the vote '
                )
        }
        else{
            entertext(
                'Something was misspelled. Try again.')
        }

    });                 
}