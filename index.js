const readline = require('readline-sync')

function start(){
    const content = {}
    
    content.searchTerm = askAndReturnSearchTerm()
    content.prefix = askAndReturnPrefix()
    
    function askAndReturnSearchTerm() {
        return readline.question('Type a Wikipedia Search Term: ')
    }
    
    function askAndReturnPrefix() {
        const prefixes = ['Who is','What is','The history of']
        const selectedPrefixIndex = readline.keyInSelect(prefixes, 'Choose one option:') 
        const selectedPrefixText = prefixes[selectedPrefixIndex]
        
        console.log(selectedPrefixIndex)
        console.log(selectedPrefixText)
    }
    
    console.log(content)
   
}

start()
