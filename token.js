class Tokenizer {
    constructor(code) {
        this.code = code;
        this.tokens = [];
        this.current = 0;
    }

    tokenize() {
        const tokenRegex = /\b(let|function|key|press|if|else|return|while|for)\b|[a-zA-Z_][a-zA-Z0-9_]*|\d+|[=(){};,<>+-/*]/g;
        let match;

        while ((match = tokenRegex.exec(this.code)) !== null) {
            this.tokens.push(match[0]);
        }
        return this.tokens;
    }
}

class Parser {
    constructor(tokens) {
        this.tokens = tokens;
        this.current = 0;
    }

    parse() {
        const ast = { type: "Program", body: [] };
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
        } else if (token === "key") {
            return this.parseKeyPress();
        } else if (token === "if") {
            return this.parseIfStatement();
        } else if (token === "while") {
            return this.parseWhileLoop();
        } else if (token === "for") {
            return this.parseForLoop();
        }
    }

    parseVariableDeclaration() {
        this.current++;
        const name = this.tokens[this.current++];
        this.current++;
        const value = this.tokens[this.current++];
        return { type: "VariableDeclaration", name, value };
    }

    parseFunctionDeclaration() {
        this.current++;
        const name = this.tokens[this.current++];
        this.current++;
        this.current++;
        return { type: "FunctionDeclaration", name };
    }

    parseKeyPress() {
        this.current++;
        const event = this.tokens[this.current++];
        const action = this.tokens[this.current++];
        return { type: "KeyPress", event, action };
    }

    parseIfStatement() {
        this.current++;
        const condition = this.tokens[this.current++];
        this.current++;
        return { type: "IfStatement", condition };
    }

    parseWhileLoop() {
        this.current++;
        const condition = this.tokens[this.current++];
        this.current++;
        return { type: "WhileLoop", condition };
    }

    parseForLoop() {
        this.current++;
        const init = this.tokens[this.current++];
        const condition = this.tokens[this.current++];
        const update = this.tokens[this.current++];
        this.current++;
        return { type: "ForLoop", init, condition, update };
    }
}

class Compiler {
    constructor(ast) {
        this.ast = ast;
    }

    compile() {
        let output = "";
        for (const node of this.ast.body) {
            output += this.generateCode(node) + "\n";
        }
        return output;
    }

    generateCode(node) {
        switch (node.type) {
            case "VariableDeclaration":
                return `let ${node.name} = ${node.value};`;
            case "FunctionDeclaration":
                return `function ${node.name}() {}`;
            case "KeyPress":
                return `document.addEventListener('keydown', (event) => { if (event.key === '${node.event}') ${node.action}(); });`;
            case "IfStatement":
                return `if (${node.condition}) { }`;
            case "WhileLoop":
                return `while (${node.condition}) { }`;
            case "ForLoop":
                return `for (${node.init}; ${node.condition}; ${node.update}) { }`;
            default:
                return "";
        }
    }
}

// مثال على التحليل والترجمة
const code = `let x = 10; function move() { drawSprite("player", x, 20); } key press W moveUp(); if x > 5 {} while x < 10 {} for i = 0; i < 5; i++ {}`;
const tokenizer = new Tokenizer(code);
const tokens = tokenizer.tokenize();
const parser = new Parser(tokens);
const ast = parser.parse();
const compiler = new Compiler(ast);
const compiledCode = compiler.compile();
console.log(compiledCode);
