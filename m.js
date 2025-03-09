monaco.languages.setMonarchTokensProvider("cubec", {
    tokenizer: {
        root: [
            [/\b(import|let|const|function|class|new|if|else|while|for|return|break|continue|draw|move|sound|rotate|scale|spawn|destroy|add|line|PrintD|Create|setColor|setSize|getPosition|getSize|log|ctx|debug|loadImage|loadScript|saveGame|loadGame|setGravity|applyForce|setVelocity|getVelocity|playSound|stopSound|setVolume|setCameraPosition|getCameraPosition|shakeCamera|createLayer|setLayer|removeLayer|onCollision|detectCollision|connectToServer|sendData|receiveData)\b/, "keyword"],
            [/\d+/, "number"],
            [/"[^"]*"/, "string"],
            [/[{}()\[\]]/, "delimiter"],
        ]
    }
})