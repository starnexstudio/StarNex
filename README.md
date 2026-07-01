# StarNex
Modern Web Design &amp; SEO Agency Website built with HTML, CSS and JavaScript.

## Contact form → WhatsApp (automatic delivery)

The contact form sends leads straight to StarNex's WhatsApp via
[CallMeBot](https://www.callmebot.com/blog/free-api-whatsapp-messages/), a
free API for sending yourself WhatsApp messages programmatically. One-time
setup, done from the phone that should receive leads:

1. Save CallMeBot's WhatsApp contact (get the current number from the link
   above — it can change, so always check their page rather than an old copy).
2. From that phone, message it: `I allow callmebot to send me messages`
3. It replies with your personal `apikey`.
4. Open [js/script.js](js/script.js) and paste that key into `CALLMEBOT_APIKEY`
   (search for `PASTE_YOUR_CALLMEBOT_APIKEY_HERE`).

Until that key is set, the form falls back to opening a `wa.me` link for the
visitor to send themselves — so it keeps working either way.

## CSS build

`css/style.css` is the source of truth; `css/style.min.css` is what the HTML
actually loads. After editing `css/style.css`, regenerate the minified file
so the two never drift apart:

```
pip install rcssmin
python tools/build-css.py
```
