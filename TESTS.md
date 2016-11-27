# Tests

At the moment we do manual testing.
This is the list we currently run against.

If you find anything more you think we should test then please just let us know and we'll add it.


| Test | Status |
|-------------------------------------------------------------------------------------------------------------------------------|--------|
| Load terms and engines from an external JSON file | ✓ |
| Re-load the JSON file every six hours | ✓ |
| It should remember settings between browser sessions | ✓ |
| When doing a Google image search for any term defined a new window with an updated search should appear | ✓ |
| When showing a new window, the original window and the new window should split 50/50 | ✓ |
| When closing the window with the updated term the original window should re-gain it's size | ✓ |
| When closing the original window the new window should get the size the original window had before opening | ✓ |
| When doing a new matching search in the new window the search should be done in the original window | ✓ |
| If the user has opened a new tab and then does a new search the search should be done in the original tab | ✓ |
| If the user has closed the tab we used for search a new tab should be opened in that window | ✓ |
| Matching should work on pressing enter | ✓ |
| Matching should work on pressing the search button | ✓ |
| Matching should work on selecting a term in the auto-complete list | ✓ |
| Matching should run on page-load | ✓ |
| Matching should not run for autocomplete | ✓ |
| If you close the new window and re-do the same search the window should appear again | ✓ |
| You should be able to show and hide the toolbar from a setting in the popup | ✓ |
| There should be a dropdown with pre-defined terms | ✓ |
| The toolbar should start open upon install | ✓ |
| There should be a close button in the toolbar | ✓ |
| There should be a tip functionality with approve yes/no buttons | ✓ |
| You should be able to share the campaign-site url on Twitter, Facebook and LinkedIn | ✓ |
| There should be a link to the re-search site | ✓ |
| The icon should be correct | ✓ |
| The drop-down should go back to it's original state when closed | ✓ |
| When choosing a term in the drop-down the page should do a search for that term | ✓ |
| When searching for a new term from the drop-down the alternate window should work the same as when searching in any other way | ✓ |
