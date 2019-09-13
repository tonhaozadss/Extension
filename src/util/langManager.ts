import fetchJSON from "./functions/fetchJSON";
var apiBase = "https://api.premid.app/v2/";
import { error } from "./debug";

var defaultLanguage: any, currLanguage: any;

export async function updateStrings() {
  defaultLanguage = await fetchJSON(`${apiBase}langFile/extension/en`).catch(
    err => {
      error("Error while loading default translations");
    }
  );

  currLanguage = await fetchJSON(`${apiBase}langFile/extension/en`).catch(
    err => {
      if (err.status === 404) error(`No translations found for en`);
    }
  );

  if (typeof defaultLanguage === "undefined") return;
  if (typeof currLanguage === "undefined")
    chrome.storage.local.set({
      languages: {
        default: defaultLanguage
      }
    });
  else
    chrome.storage.local.set({
      languages: {
        default: defaultLanguage,
        user: currLanguage
      }
    });
}

var initialLoader = null;
export async function loadStrings() {
  if (initialLoader == null) initialLoader = true;
  else initialLoader = false;

  return new Promise((resolve, reject) => {
    if (typeof defaultLanguage !== "undefined") resolve();

    if (initialLoader) {
      chrome.storage.local.get("languages", ({ languages }) => {
        defaultLanguage = languages.default;
        if (typeof languages.user !== "undefined")
          currLanguage = languages.user;

        resolve();
      });
    } else {
      var loadStatus = setInterval(() => {
        if (typeof defaultLanguage !== "undefined") {
          clearInterval(loadStatus);
          resolve();
        }
      }, 5);
    }
  });
}

export function getString(string: string) {
  return new Promise(async (resolve, reject) => {
    await loadStrings();

    if (
      typeof currLanguage !== "undefined" &&
      typeof currLanguage[string] !== "undefined"
    )
      resolve(currLanguage[string]);
    else if (typeof defaultLanguage[string] !== "undefined")
      resolve(defaultLanguage[string]);
    else error(`String ${string} not found`);
  });
}