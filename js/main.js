"use strict";

// So we don't have to keep re-finding things on page, find DOM elements once:

const $body = $("body");
const $storiesLoadingMsg = $("#stories-loading-msg");
const $storiesContainer = $("#stories-container"); 
const $storiesLists = $(".stories-list");
const $allStoriesList = $("#all-stories-list");
const $favoritedStories = $("#favorited-stories");
const $ownStories = $("#my-stories");
const $loginForm = $("#login-form");
const $signupForm = $("#signup-form");
const $submitForm = $("#submit-form");
const $userProfile = $("#user-profile");
const $navLogin = $("#nav-login");
const $navUserProfile = $("#nav-user-profile");
const $navLogOut = $("#nav-logout");
const $navSubmitStory = $("#nav-submit-story");


/** To make it easier for individual components to show just themselves, this
 * is a useful function that hides pretty much everything on the page. After
 * calling this, individual components can re-show just what they want.
 */

function hidePageComponents() {
  const components = [
    $allStoriesList,
    $storiesLists,
    $loginForm,
    $signupForm,
    $submitForm,
    $userProfile
  ];
  components.forEach(component => component.hide());
}

/** Overall function to kick off the app. */

async function start() {
  console.debug("start");

  // Code to handle remembered users and initial story display
  await checkForRememberedUser();
  await getAndShowStoriesOnStart();

  // Update UI if user is logged in
  if (currentUser) {
    updateUIOnUserLogin();
  }
}

// Once the DOM is entirely loaded, begin the app

console.warn("Reminder: This application generates debug messages in the console. " +
             "Ensure 'Verbose' is enabled in your console settings to view these messages.");

             
$(start);
