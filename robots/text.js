const algorithmia = require('algorithmia') //modulo importado
const algorithmiaApiKey = require('../credentials/algorithmia.json').apiKey
const sentenceBoundaryDetection = require('sbd')

const watsonApiKey = require('../credentials/watson-nlu.json').apiKey

var NaturalLanguageUnderstandingV1 = require('ibm-watson/natural-language-understanding-node.js')

var nlu = new NaturalLanguageUnderstandingV1({
    url: 'https://api.us-south.natural-language-understanding.watson.cloud.ibm.com/instances/aea2f9b5-38b6-4751-b061-7f929bb9bc0d',
    iam_apikey: watsonApiKey
    
})

nlu.analyze({
    text: "Hi I'm Michael Jackson and I like doing the moonwalk move",
    features: {
        keywords: {}
    } 
}, (error, response) => {
        if(error){
            throw error
        }
    

    console.log(JSON.stringify(response, null, 4))
    process.exit(0)
})

async function robot(content){
    await fetchContentFromWikipedia(content)        //baixa o conteúdo do Wikipedia 
          sanitizeContent(content)                  //Limpa o conteúdo baixado do wikipedia
          breakContentIntoSentences(content)        //quebra o conteúdo em sentencas    
    
    async function fetchContentFromWikipedia(content){
        const algorithmiaAuthenticated = algorithmia(algorithmiaApiKey)
        const wikipediaAlgorithm = algorithmiaAuthenticated.algo('web/WikipediaParser/0.1.2')
        const wikipediaResponse = await wikipediaAlgorithm.pipe(content.searchTerm) //realiza a busca pelo termo 
        const wikipediaContent = wikipediaResponse.get()                           //resposta da consulta realizada
        
        content.sourceContentOriginal = wikipediaContent.content

    }
    
    function sanitizeContent(content){
        /*quebra o conteúdo em linhas e remove as linhas em branco*/
        const withoutBlankLinesAndMarkdown = removeBlankLinesAndMarkdown(content.sourceContentOriginal)
        const withoutDatesInParenteses = removeDatesInParenteses(withoutBlankLinesAndMarkdown)
        
        content.sourceContentSanitized = withoutDatesInParenteses

        function removeBlankLinesAndMarkdown(text){
            const allLines = text.split('\n')
            
            const withoutBlankLinesAndMarkdown = allLines.filter((line) => {
                if (line.trim().length === 0 || line.trim().startsWith('=')){
                    return false
                }
                
                return true
            })
            
            return withoutBlankLinesAndMarkdown.join(' ')
        }
    }

    function removeDatesInParenteses(text){
        return text.replace(/\((?:\([^()]*\)|[^()])*\)/gm, '').replace(/  /g,' ').replace(/\\\'/g, "'")
    
    }

    function breakContentIntoSentences(content){
        content.sentences = []

        const sentences = sentenceBoundaryDetection.sentences(content.sourceContentSanitized)
        
        sentences.forEach((sentence)=>{
            content.sentences.push({
                text: sentence,
                keywords: [],
                images: []
            })
        })
    }
}

module.exports = robot
