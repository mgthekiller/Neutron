function runCode() {
    const code = document.getElementById('code-editor').value;
  
    // Process and execute the code in your language
    class Lexer {
        constructor(code) {
            this.code = code;
            this.tokens = [];
            this.tokenize();
        }
        
        tokenize() {
            let regex = /\s*(=>|let|function|print|printAR|draw|if|else|while|return|[{}();,]|[a-zA-Z_][a-zA-Z0-9_]*|\d+|\".*?\")\s*/g;
            let match;
            while (match = regex.exec(this.code)) {
                this.tokens.push(match[1]);
            }
        }
    }
    
    class Parser {
        constructor(tokens) {
            this.tokens = tokens;
            this.current = 0;
        }
        
        parse() {
            let ast = { type: "Program", body: [] };
            while (this.current < this.tokens.length) {
                ast.body.push(this.parseStatement());
            }
            return ast;
        }
        
        parseStatement() {
            let token = this.tokens[this.current];
            if (token === "let") {
                return this.parseVariableDeclaration();
            } else if (token === "function") {
                return this.parseFunctionDeclaration();
            } else if (token === "print") {
                return this.parsePrintStatement();
            } else if (token === "printAR") {
                return this.parsePrintARStatement();
            } else if (token === "draw") {
                return this.parseDrawStatement();
            } else {
                return this.parseExpression();
            }
        }
        
        parseVariableDeclaration() {
            this.current++; // Skip 'let'
            let name = this.tokens[this.current++];
            this.current++; // Skip '='
            let value = this.parseExpression();
            return { type: "VariableDeclaration", name, value };
        }
        
        parseFunctionDeclaration() {
            this.current++; // Skip 'function'
            let name = this.tokens[this.current++];
            this.current++; // Skip '('
            let params = [];
            while (this.tokens[this.current] !== ")") {
                params.push(this.tokens[this.current++]);
                if (this.tokens[this.current] === ",") this.current++;
            }
            this.current++; // Skip ')'
            this.current++; // Skip '{'
            let body = [];
            while (this.tokens[this.current] !== "}") {
                body.push(this.parseStatement());
            }
            this.current++; // Skip '}'
            return { type: "FunctionDeclaration", name, params, body };
        }
        
        parsePrintStatement() {
            this.current++; // Skip 'print'
            let value = this.parseExpression();
            return { type: "PrintStatement", value };
        }
        
        parsePrintARStatement() {
            this.current++; // Skip 'printAR'
            let value = this.parseExpression();
            return { type: "PrintARStatement", value };
        }
        
        parseDrawStatement() {
            this.current++; // Skip 'draw'
            let value = this.parseExpression();
            return { type: "DrawStatement", value };
        }
        
        parseExpression() {
            let token = this.tokens[this.current++];
            if (!isNaN(token)) {
                return { type: "NumberLiteral", value: Number(token) };
            }
            if (token.startsWith("\"")) {
                return { type: "StringLiteral", value: token.slice(1, -1) };
            }
            return { type: "Identifier", name: token };
        }
    }
    
    class Interpreter {
        constructor(ast) {
            this.ast = ast;
            this.env = {};
        }
        
        evaluate(node) {
            switch (node.type) {
                case "Program":
                    node.body.forEach(stmt => this.evaluate(stmt));
                    break;
                case "VariableDeclaration":
                    this.env[node.name] = this.evaluate(node.value);
                    break;
                case "NumberLiteral":
                    return node.value;
                case "StringLiteral":
                    return node.value;
                case "Identifier":
                    return this.env[node.name];
                case "FunctionDeclaration":
                    this.env[node.name] = node;
                    break;
                case "PrintStatement":
                    console.log(this.evaluate(node.value));
                    break;
                case "PrintARStatement":
                    console.log("AR Output:", this.evaluate(node.value));
                    break;
                case "DrawStatement":
                    let img = document.createElement("img");
                    img.src = this.evaluate(node.value);
                    document.body.appendChild(img);
                    console.log(`Drawing image: ${img.src}`);
                    break;
            }
        }
        
        run() {
            this.evaluate(this.ast);
        }
    }
    
    let code = `
        let nif = 23.5 / 1;
        let kot = 54 * nif;
        let pri = kot * nif;
        printAR(pri);
        draw "player.png";
    `;
    
    let lexer = new Lexer(code);
    let parser = new Parser(lexer.tokens);
    let ast = parser.parse();
    let interpreter = new Interpreter(ast);
    interpreter.run();
    console.log(interpreter.env);
    
    // Here, you would write a simple interpreter or compiler for your language
    alert('Running your custom code: ' + code);
  
    // For example, if you have a function like drawSprite(), moveObject(), etc.
    // You can map them to JavaScript functions and execute the code.
  }
  