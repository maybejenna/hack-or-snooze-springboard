"use strict";

// This is the global list of the stories, an instance of StoryList

let storyList;

// Event listeners
$('#new-story-form').on('submit', submitNewStory); // Ensure this matches the ID of your story form
$ownStories.on("click", ".trash-can", deleteStory);
$storiesLists.on("click", ".star", toggleStoryFavorite);

/** Get and show stories when site first loads. */
async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();
  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();

  const showStar = Boolean(currentUser);

  return $(`
      <li id="${story.storyId}">
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

function getDeleteBtnHTML() {
  return `
      <span class="trash-can">
        <i class="fas fa-trash-alt"></i>
      </span>`;
}

function getStarHTML(story, user) {
  const isFavorite = user.isFavorite(story);
  const starType = isFavorite ? "fas" : "far";
  return `
      <span class="star">
        <i class="${starType} fa-star"></i>
      </span>`;
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

const $storyForm = $("#story-form-id"); // Replace `#story-form-id` with the actual form ID

function generateStoryMarkup(story, showDeleteBtn = false) {
  const hostName = story.getHostName();
  const showStar = Boolean(currentUser);
  const starHTML = showStar ? getStarHTML(story, currentUser) : "";
  const deleteBtnHTML = showDeleteBtn ? getDeleteBtnHTML() : "";

  return $(`
    <li id="${story.storyId}">
      ${starHTML}
      ${deleteBtnHTML}
      <a href="${story.url}" target="a_blank" class="story-link">${story.title}</a>
      <small class="story-hostname">(${hostName})</small>
      <br>
      <small class="story-author">by ${story.author}</small>
      <br>
      <small class="story-user">posted by ${story.username}</small>
    </li>
  `);
}


async function deleteStory(evt) {
  try {
     console.debug("deleteStory");

    const $closestLi = $(evt.target).closest("li");
    const storyId = $closestLi.attr("id");

    await storyList.removeStory(currentUser, storyId);
    currentUser.ownStories = currentUser.ownStories.filter(s => s.storyId !== storyId);
    putUserStoriesOnPage();
  } catch (error) {
    console.error("Failed to delete story:", error);
  }
}

$ownStories.on("click", ".trash-can", deleteStory);

$(document).ready(function() {
  $('#submit-story-btn').on('click', function(evt) {
      evt.preventDefault(); // Prevents the default form submission if it's inside a form
      submitNewStory(); // Calls your function to handle the story submission
  });
});

async function submitNewStory(evt) {
  evt.preventDefault();

  const title = $("#story-title").val();
  const author = $("#story-author").val();
  const url = $("#story-url").val();
  const newStory = { title, author, url };

  const story = await storyList.addStory(currentUser, newStory);

  // Add to the main story list, not to favorites or own stories
  $allStoriesList.prepend(generateStoryMarkup(story));
  $storyForm.trigger("reset").slideUp("slow");

  // Display a confirmation message
  showAlert('Your story was submitted successfully!');
  function showAlert(message) {
    const $alert = $('<div class="alert-success"/>').text(message);
    $('body').append($alert);
    setTimeout(() => $alert.fadeOut(), 3000); // Message disappears after 3 seconds
  }
}

$('#new-story-form').on('submit', async function(evt) {
  evt.preventDefault();
  // Logic to handle the new story submission
  // You can use the values from the form inputs to create a new story
});

// Event listener for submitting the new story form
$storyForm.on("submit", submitNewStory);


  // Update the stories array to remove the deleted story
  function putUserStoriesOnPage() {
    $ownStories.empty();

    if (currentUser.ownStories.length === 0) {
        $ownStories.append("<h5>No stories added by user yet!</h5>");
    } else {
        for (let story of currentUser.ownStories) {
            const $story = generateStoryMarkup(story, true); // 'true' to show delete button
            $ownStories.append($story);
        }
    }

    $ownStories.show();
}
  
  /******************************************************************************
   * Functionality for favorites list and starr/un-starr a story
   */
  
  /** Put favorites list on page. */
  
  function putFavoritesListOnPage() {
    $favoritedStories.empty();

    if (currentUser.favorites.length === 0) {
        $favoritedStories.append("<h5>No favorites added!</h5>");
    } else {
        for (let story of currentUser.favorites) {
            const $story = generateStoryMarkup(story);
            $favoritedStories.append($story);
        }
    }

    $favoritedStories.show();
}
  
  /** Handle favorite/un-favorite a story */
  
  async function toggleStoryFavorite(evt) {
    console.debug("toggleStoryFavorite");
  
    const $tgt = $(evt.target);
    const $closestLi = $tgt.closest("li");
    const storyId = $closestLi.attr("id");
    const story = storyList.stories.find(s => s.storyId === storyId);
  
    // Toggle favorite status
    if ($tgt.hasClass("fas")) {
      await currentUser.removeFavorite(story);
      $tgt.removeClass("fas").addClass("far"); // Change from filled to outlined star
    } else {
      await currentUser.addFavorite(story);
      $tgt.removeClass("far").addClass("fas"); // Change from outlined to filled star
    }
  }

  
  $storiesLists.on("click", ".star", toggleStoryFavorite);
  