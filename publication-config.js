/* PUBLICATION CONTROL ROOM
   Change the default design here; article content does not need editing.
   Adding a new look: add one CSS file under themes/, register it below,
   then change defaults.theme. Do not change past edition theme files.
*/
window.VCS_PUBLICATION = {
  version: 1,
  title: "Vice City Sinner",
  defaultTheme: "other-edition",
  defaultSettings: {layout:"broadsheet",density:"classic",headlines:"newspaper",accent:"#2b4d58"},
  themes: {
    "other-edition": {
      label:"The Other Edition",
      description:"The original alternate-universe broadsheet. Aged paper, razor-sharp ink, details that wait to be found.",
      css:"themes/other-edition.css",
      defaultAccent:"#2b4d58",
      mode:"paper"
    },
    "blue-hour": {
      label:"Blue Hour",
      description:"A dreamy, sea-glass coastal press. Softer lines, ocean shadows, room to breathe.",
      css:"themes/blue-hour.css",
      defaultAccent:"#4f8492",
      mode:"coast"
    },
    "black-letter": {
      label:"Black Letter",
      description:"A sinister night-edition tabloid. Ink-black stock, pale lettering, unexpected bursts of color.",
      css:"themes/black-letter.css",
      defaultAccent:"#cd8c73",
      mode:"noir"
    }
  },
  /* Design proofs only. Do not list unissued designs as published editorial editions. */
  proofArchive: [
    {id:"proof-001",label:"The Other Edition",date:"November 2026",theme:"other-edition",status:"Design proof"}
  ]
};
