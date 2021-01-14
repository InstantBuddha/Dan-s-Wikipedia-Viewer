var resultJSON;
const imageLink = 'https://cdn2.iconfinder.com/data/icons/media-and-navigation-buttons-square/512/Button_2-512.png';
var localWikiList = [];
var wikiDisplayList = [];
const formattedErrorMessageAsAList = [{
  toDisplayHTML: function() {
    return `<li>
    <div class="li-wrapper" onclick="window.location = &#34;https://en.wikipedia.org/wiki/Error&#34;">
      <div class="left">
        <img src=https://upload.wikimedia.org/wikipedia/en/thumb/8/80/Wikipedia-logo-v2.svg/200px-Wikipedia-logo-v2.svg.png alt="There seems to be a problem">
      </div>
      <div class="right">
        <h2>Error</h2>Houston, we have a problem!</div>
      </div>
    </li>`;
  }
}];

//event handlers:
$("#randomButton").click(() => {
  window.open("https://en.wikipedia.org/wiki/Special:Random");
});

$("#searchButton").click(() => {
  startSearch($("#searchBox").val());
});

$("#searchBox").keydown((key) => {
  if (key.keyCode == 13) {
    startSearch($("#searchBox").val());
  }
});

//Object constructor:
function WikiObject(articleTitle, articleLink, summary, imageLink) {
  this.articleTitle = articleTitle;
  this.articleLink = articleLink;
  this.summary = summary;
  this.imageLink = imageLink;

  this.toDisplayHTML = function() {

    let htmlString = `<li><div class="li-wrapper" onclick="window.location = &#34;${this.articleLink} &#34;"><div class="left">`;
    if (this.imageLink) {
      htmlString += `<img src=${this.imageLink} alt=${this.articleTitle}>`;
    } else {
      htmlString += `<img src=https://upload.wikimedia.org/wikipedia/en/thumb/8/80/Wikipedia-logo-v2.svg/200px-Wikipedia-logo-v2.svg.png alt="No image for this article">`;
    }
    htmlString += `</div><div class="right"><h2>${this.articleTitle}</h2>`;
    if (this.summary) {
      htmlString += this.summary;
    }

    htmlString += "</div></div></li>";
    //console.log(htmlString);
    return htmlString;

  };
}

//functions:
function startSearch(keyWord) {
  console.log("KEYWORD: " + keyWord);
  localWikiList = [];
  wikiDisplayList = [];
  var wikiURL = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${keyWord}&format=json&callback=?`;

  $.getJSON(wikiURL, function(wikiJSON) {
      console.log("info sent ", JSON.stringify(wikiJSON));
      for (var i = 0; i < wikiJSON[1].length; i++) {
        let iTitle = wikiJSON[1][i];
        let iLink = wikiJSON[3][i];
        let wikiObjectForList = new WikiObject(
          iTitle,
          iLink
        );
        localWikiList.push(wikiObjectForList);
      }

    })
    .done(function() {

      //console.log("ready " + JSON.stringify(localWikiList[0]));
      if (localWikiList.length === 0) {
        listDisplayUpdater(formattedErrorMessageAsAList);
        return;
      }
      localWikiDataAdder(localWikiList);
    })
    .fail(function() {
      console.log("error");
      listDisplayUpdater(formattedErrorMessageAsAList);
    });

}

function localWikiDataAdder(localListToBeAddedTo) {
  console.log("localWikiDataAdder started");
  for (var i = 0; i < localListToBeAddedTo.length;) {
    let localListItem = localListToBeAddedTo[i];
    let queryURL = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=info%7Cdescription%7Cpageimages&titles=${localListItem.articleTitle}&pithumbsize=200&callback=?`;

    $.getJSON(queryURL, function(wikiQueryJSON) {
        console.log("query sent ", JSON.stringify(wikiQueryJSON));

      })
      .done(function(wikiQueryJSON) {
        let tempInfoObject = wikiQueryJSON.query.pages;
        let tempInfoObjectCleaned = tempInfoObject[Object.keys(tempInfoObject)[0]];
        //console.log(JSON.stringify(tempInfoObjectCleaned));
        if (tempInfoObjectCleaned.hasOwnProperty('description')) {
          localListItem.summary = tempInfoObjectCleaned.description;
        }
        if (tempInfoObjectCleaned.hasOwnProperty('thumbnail')) {
          localListItem.imageLink = tempInfoObjectCleaned.thumbnail.source;
        }

        //console.log("localListItem: " + JSON.stringify(localListItem));
        wikiDisplayList.push(localListItem);
        console.log(wikiDisplayList);

        if (i == 10) {
          listDisplayUpdater(wikiDisplayList);
        }
      })
      .fail(function() {
        console.log("error with adding");
      });
    i++;
  }

}

function listDisplayUpdater(listToBeDisplayed) {
  console.log(listToBeDisplayed);
  $("#forTheList").empty();
  $("#firstText").append("<ul>");
  for (wikiDisplayitem of listToBeDisplayed) {
    $("#forTheList").append(wikiDisplayitem.toDisplayHTML());
  }

  $("#forTheList").append("</ul>");
}
