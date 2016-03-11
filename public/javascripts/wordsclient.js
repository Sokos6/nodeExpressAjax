window.addEventListener("load", function () {
    var searchField = document.getElementById("searchWord");
    var searchList = document.getElementById("wordlist");
    searchField.addEventListener("keyup", function (evt) {
        var abbrev = searchField.value;
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
                if (xhr.readyState == 4 && xhr.status == 200) {
                    searchList.innerHTML = "";
                    for (var i = 0; i < xhr.response.length; i++) {
                        var opt = document.createElement("option");
                        opt.value = xhr.response[i].id;
                        opt.label = xhr.response[i].word;
                        searchList.appendChild(opt);
                    }
                }
            }
            //        var uri = "/wordsapi/v1/search/" + abbrev;
            //        var thresh = searchField.dataset.threshold;
            //        if (thresh && Number(thresh) > 0) {
            //            uri += "?threshold=" + Number(thresh);
            //        }
            //        xhr.open("GET", uri);
            //        xhr.responseType = 'json';
            //        xhr.send();
        var uri = "/wordsapi/v2/search/" + abbrev;
        var params = []; // Empty array for optional URI parameters
        var thresh = searchField.dataset.threshold;
        if (thresh && Number(thresh) > 0) {
            params.push("threshold=" + Number(thresh)); //Add to array
        }
        var caseSens = document.getElementById("caseSearch").checked;
        if (caseSens) {
            params.push("caseSensitive=true"); //Add to array
        }
        // No more optional parameters to add.
        if (params.length) { //Do we have any optional parameters?
            uri += "?" + params.join("&"); //Concatenate with &s, append after ?
        }
        xhr.open("GET", uri);
        xhr.responseType = 'json';
        xhr.send();


    }); //Word search keyup callback

    searchList.addEventListener("change", function () {
        searchField.value = searchList.options[searchList.selectedIndex].label;
    })


    //test
    var countField = document.getElementById("countWord");
    var countDisplay = document.getElementById("displayCount");
    countField.addEventListener("keyup", function (evt) {
        var abbrev = countField.value;
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && xhr.status == 200) {
                //var resp = JSON.parse(xhr.responseText);
                var resp = xhr.response;
                //countDisplay.innerHTML = "<li>" + resp.count + " words match " + resp.abbrev + "</li>";
                countDisplay.innerHTML = "";
                for (var i = 0; i < resp.length; i++) {
                    var item = document.createElement("li");
                    item.innerHTML = resp[i].count + " words match " + resp[i].abbrev;
                    countDisplay.appendChild(item);
                }
            }
        }
        xhr.open("GET", "/wordsapi/v2/count/" + abbrev);
        xhr.responseType = 'json';
        xhr.send();
    });

    var createwordevent = function () {
        var xhrc = new XMLHttpRequest();
        var uric = "/wordsapi/v2/dictionary/";
        var jsonword = {
            "word": searchWord.value
        };
        var json = JSON.stringify(jsonword)
        xhrc.onreadystatechange = function () {}
        xhrc.open("POST", uric);
        xhrc.responseType = 'json';
        xhrc.setRequestHeader("Content-type", "application/json");
        xhrc.send(json);
    };
});