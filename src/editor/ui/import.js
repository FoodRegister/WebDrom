
document.addEventListener("DOMContentLoaded", () => {
    async function handleAddedNode (element) {
        for (let child of element.childNodes) handleAddedNode(child);
        if (element.localName !== "import") return ;
        
        let uri = element.attributes["href"].nodeValue
        let res = await fetch(uri)
        element.outerHTML = await res.text()
    }

    let observer = new MutationObserver( (mutations) => {
        for (let mutation of mutations) {
            for (let addedNode of mutation.addedNodes) {
                handleAddedNode(addedNode);
            }
        }
    } )
    observer.observe(document.body, {childList: true, attributes: true, subtree: true, attributeOldValue: true, attributeFilter: ['class', 'style']})

    for (let to_import of document.querySelectorAll("import")) {
        handleAddedNode(to_import)
    }
})