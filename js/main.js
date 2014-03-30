var votesHash = {};
var totalVotesHash = {};

$(document).ready(function(){    
    //implement autogrow of the textbox
    $('#searchbox').autosize();

    $('#searchbox').blur(function(){
        $('#searchbox').focus();
        $('#searchbox').select();
    });
    //auto type, fade out, select cursor 
    // autotype("Hey.", 1500, 80);
    autotype("It's election day! Ask me questions.", 1500, 80);   
    handleAnswer(answer, "none");

});
    // swing states
    function swing_states_graphic() {   
        $.getJSON("http://ec2-184-73-124-192.compute-1.amazonaws.com/jsonp/results?callback=?", function(data) {
            var data_Romney = [data.state.CO.race_code.PR.race_candidate_id.PR0800002.votes_total,
            data.state.FL.race_code.PR.race_candidate_id.PR1200002.votes_total,
            data.state.OH.race_code.PR.race_candidate_id.PR3900002.votes_total,
            data.state.VA.race_code.PR.race_candidate_id.PR5100002.votes_total];        
            var data_Obama = [data.state.CO.race_code.PR.race_candidate_id.PR0800001.votes_total,
            data.state.FL.race_code.PR.race_candidate_id.PR1200001.votes_total,
            data.state.OH.race_code.PR.race_candidate_id.PR3900001.votes_total,
            data.state.VA.race_code.PR.race_candidate_id.PR5100001.votes_total];         
            $('#results').highcharts({      
                chart: { type: 'bar' },
                title: { text: 'Swing States' },            
                xAxis: { categories: ['Colorado', 'Florida', 'Ohio', 'Virginia'] },
                yAxis: { min: 0, title: { text: '' } },

                legend: { backgroundColor: '#FFFFFF', reversed: true },
                plotOptions: {
                    series: { stacking: 'normal'} },
                    series: [{
                        name: 'Romney',
                        data: data_Romney,
                        color: '#FF1919'

                    }, {
                        name: 'Obama',
                        data: data_Obama,
                        color: '#3333CC'
                    }]
                });
        });
}

// migratory information 
function migratory_info(){
    $('#results').highcharts({
        chart: {type: 'bar' },
        title: {text: 'Key Demographic Groups' },
        xAxis: {categories: ['Independents', 'Hispanics', 'Youth', 'Women'] },
        yAxis: {min: 0 ,title: {text: ''} },
        legend: { backgroundColor: '#FFFFFF', reversed: true },
        plotOptions: {
            series: {
                stacking: 'normal'
            }
        },
        series: [{
            name: 'Romney',
            data: [5, 10, 20, 4],
            color: '#FF1919'

        }, {
            name: 'Obama',
            data: [55, 70, 60, 3],
            color: '#3333CC'
        }]
    });
}

function handleAnswer(answer_func, answer_type) { //capturing the enter
    $("#searchbox").keypress(function(e) {
        removeAnswer();
        if (e.which == "13"){
            answer_func($(this).val(), answer_type);                
            fadeAndFocus($(this).val(), 1500, 4, 3);
        }
    });
}

function autotype(txt, fadeTime, delay){
    console.log("autotype");
    txt= txt.split('');
    for ( i=0; i<txt.length;i++){   
        setTimeout(function(){        
            $('#searchbox').val( $('#searchbox').val() + txt.shift());
        }, delay * i);       
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
    $("#results").empty();
}

function entertext(answer) {    
    $("#results").append("<h1>" + answer + "</h1>");
}

function answer(question, type) {    
    // FUNSIES DEMO
    if (question == "who's the prettiest?") { entertext("YOU ARE");}
    if (question == "who's the prettiest now?") { entertext("STILL YOU"); }
    if (type == "none") {        
        if (question.match(/^is\s\w*\swinning(\?)*$/)) {     
            var name = question.replace("is", "").replace("winning?", "");            
            getCandidateResults(name);
        }
        if (question.match(/^who's\swinning\sin\s\my\s(...)$/)) {        
            getUserState('presidential');
        }
        if (question.match(/^who's\srunning\sfor\s(\w*)(\?)*$/)) {            
            var position = question.replace("who's", "").replace("running for", "").replace("?","").replace(/\s+/g, "");            
            if (position == "senate") {                
                getUserState('senate');
            }
            else if ((position == "congress") || (position == "representative")) {
                getUserState('congress');
            }
        }
        if (question.match(/^(.*\s*)*who\sis\s(\w*\s*)+(\?)*$/)) {
            console.log("match");
            var canName = question.replace(/(.*\s*)*(?=who\sis\s)/, "").replace("who is", "").replace("?", "");
            console.log(canName);
            getCandidateInfo(canName);
        }      
    }
}

function getUserState(question_type) {
    console.log("getUserState");
    setTimeout(function(){ 
        autotype('What state do you live in?', 1500, 80)}
        , 3000);
    handleAnswer(answerState, question_type);
}

function getCandidateInfo(name) {
    console.log(name + " getCandidateInfo");
    $.getJSON("races.json", function(data) {
        console.log(data);
        $.each(data, function(key, val) {
            console.log("matched name");
            if (data[key].Candidate.indexOf(name)) {
                console.log("equals");
                entertext(name + " is a " + data[key].Party + " Congressional candidate from " + data[key].State + ".");
                return false;
            };            
        });       
        setTimeout(
            function() 
            {
                knowMore("You probably wanna know more, right?");
                name= name.split(' ');
                $("h1").remove();
                var string = 'http://www.nydailynews.com/search-results/search-results-7.113?q='+ '' + name[1] + '+'+ ''+ name[2]+'&selecturl=site';
                $("<a target='_blank' href="+ string +"> More info! </a>").appendTo("body");                
            }, 3500);
    });
}

function knowMore(text) {
    autotype(text, 3500,80);
}

  function answerState(answer, type) {
    console.log("hello");    
    if (answer.match(/^\w\w$/)){
        if (type == "presidential") {
            getCandidateResultsByState(answer);
        }
        else if (type == "senate"){
            autotype("Sorry, I'm under    construction :(", 1500, 80);
        }
        else if (type == "congress"){
            autotype("Sorry, I'm under    construction :(", 1500, 80);
        }
    }
}

function getCandidateResultsByState(state){
    $.getJSON("http://ec2-184-73-124-192.compute-1.amazonaws.com/jsonp/results?callback=?", function(data) {        
        var totalVotes = 0;
        for(k in data.state[state].race_code.PR.race_candidate_id){
            totalVotes += data.state[state].race_code.PR.race_candidate_id[k]['votes_total'];
        }

        for(k in data.state[state].race_code.PR.race_candidate_id){         
            votesHash[data.state[state].race_code.PR.race_candidate_id[k]['name']] = data.state[state].race_code.PR.race_candidate_id[k]['votes_total'];
            entertext(data.state[state].race_code.PR.race_candidate_id[k]['name'] + ' -- ' 
                + ((data.state[state].race_code.PR.race_candidate_id[k]['votes_total']/totalVotes)*100).toFixed(2) + "%");
        }

    });
}

function getCandidateResults(candidate_name) {
    candidate_name = candidate_name.replace(/ /g,'');
    $.getJSON("http://ec2-184-73-124-192.compute-1.amazonaws.com/jsonp/results?callback=?", function(data) {
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
        for(key in totalVotesHash){            // 
            totalVoteNumber += totalVotesHash[key];
            if(totalVotesHash[key] > maxVotes){
                maxKey = key;
                maxVotes = totalVotesHash[key];
            }
        }                

        if(totalVotesHash[candidate_name] == maxVotes){
            entertext("YES!");
            entertext(candidate_name + " is winning with " + ((totalVotesHash[candidate_name]/totalVoteNumber)*100).toFixed(2) + '% of the vote');
        }
        else if(totalVotesHash[candidate_name] < maxVotes){
            entertext(
                candidate_name + ' is losing with ' + ((totalVotesHash[candidate_name]/totalVoteNumber)*100).toFixed(2) + '% of the vote.' +
                maxKey + ' has ' + ((maxVotes/totalVoteNumber)*100).toFixed(2) + '% of the vote '
                );
        }
        else{
            entertext(
                'Something was misspelled. Try again.');
        }
    });                 
showMoreButton("candidates");
}

function showMoreButton (type_of_show) {    
    $("body").append("<a href='#' id='more_results' class='center'>Tell me more!</a>");
    $("#more_results").click(function() {
        if (type_of_show == "candidates"){
            swing_states_graphic();
            $("#results").after($("#searchbox"));
            hideButton();
        }
    });
}

function hideButton() {
    $("#more_results").hide();
}
