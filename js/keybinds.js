document.onkeydown = (e) => {
    switch (e.key) {
    case " ":
        if (popup.style.visibility == "hidden")
            toggleRun ();
        break;
    case "Escape":
        hidePopup ();
        break;
    case "Backspace":
        if (popup.style.visibility == "visible")
            deleteBody ();
        break;
    }
};
