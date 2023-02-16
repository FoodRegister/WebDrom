
/**
 * Implementation of JSDromadaire
 */


const Dromadaire = ( function () {
    let iota = () => { let idx = 1; return () => { return idx ++; } }
    
    const TOKEN_TYPES = {  }
    const TOKEN_TYPE_BY_ID = {}
    const token_iota_gen = iota()
    const token_gen      = (str) => {
        TOKEN_TYPES[str]                   = token_iota_gen();
        TOKEN_TYPE_BY_ID[TOKEN_TYPES[str]] = str;

        return TOKEN_TYPES[str]
    }

    const STRING_TOKEN = token_gen("STRING");
    const NAME_TOKEN   = token_gen("NAME");
    const NUMBER_TOKEN = token_gen("NUMBER");
    const DOT_TOKEN    = token_gen("DOT");
    const PLUS_TOKEN   = token_gen("PLUS");
    const MINUS_TOKEN  = token_gen("MINUS");
    const TIMES_TOKEN  = token_gen("TIMES");
    const DIVIDE_TOKEN = token_gen("DIVIDE");
    const SET_TOKEN    = token_gen("SET");

    const RBRACKET         = token_gen("RBRACKET")
    const RSQUARED_BRACKET = token_gen("RSQUARED_BRACKET")
    const RCURLY_BRACKET   = token_gen("RCURLY_BRACKET")
    const LBRACKET         = token_gen("LBRACKET")
    const LSQUARED_BRACKET = token_gen("LSQUARED_BRACKET")
    const LCURLY_BRACKET   = token_gen("LCURLY_BRACKET")
    const VERT_LINE        = token_gen("VERT_LINE")

    const EOF = token_gen("EOF")
    
    /**
     * List of operators
     */
    const OPERATOR_TREE = [
        { "char": ".",  "token": DOT_TOKEN        },
        { "char": "+",  "token": PLUS_TOKEN       },
        { "char": "-",  "token": MINUS_TOKEN      },
        { "char": "*",  "token": TIMES_TOKEN      },
        { "char": "/",  "token": DIVIDE_TOKEN     },
        { "char": "|",  "token": VERT_LINE        },
        { "char": "(",  "token": LBRACKET         },
        { "char": "[",  "token": LSQUARED_BRACKET },
        { "char": "{",  "token": LCURLY_BRACKET   },
        { "char": "}",  "token": RCURLY_BRACKET   },
        { "char": "]",  "token": RSQUARED_BRACKET },
        { "char": ")",  "token": RBRACKET         },
        { "char": "=",  "token": SET_TOKEN        },
        { "char": ";",  "token": EOF              },
        { "char": "\n", "token": EOF              }
    ]

    /**
     * PositionBased object
     */
    class PositionBased {
        setPosition (file, line, col, idx, size) {
            this.file = file
            this.line = line
            this.col  = col
            this.idx  = idx
            this.size = size;

            return this;
        }
        transferPosition (source) {
            return this.setPosition(source.file, source.line, source.col, source.idx, source.size);
        }
        position () {
            return { "file": this.file, "line": this.line, "col": this.col, "idx": this.idx, "size": this.size }
        }
        posToString () {
            return `File ${this.file.name()} at line ${this.line} at col ${this.col} with size ${this.size}`
        }
        showPosition (linePrefix="") {
            let line = this.file.getLine(this.line);
            let col  = this.col - 1;
            if (col >= 10) {
                line = "..." + line.substring( col - 7 );
                col  = 10;
            }

            let s_col = col; let e_col = col + this.size;
            if (e_col == s_col) { line += " "; e_col ++; }
            let valid = ( idx ) => s_col <= idx && idx < e_col;

            let line_v = ""
            for (let idx = 0; idx < line.length; idx ++) {
                line_v += valid(idx) ? "^" : " ";
            }
            return linePrefix + line + "\n" + linePrefix + line_v
        }
    }

    /**
     * Token Object 
     */
    class Token extends PositionBased {
        constructor (token_type, token_value=undefined) {
            super();
            this.__type  = token_type;
            this.__value = token_value;
        }

        type  () { return this.__type  }
        value () { return this.__value }
    }
    /**
     * Lexer Error
     */
    class LexerError extends PositionBased {
        constructor (message, stack) {
            super();
            this.__message = message;
            this.__stack   = stack
        }

        message () { return this.__message }
        stack   () { return this.__stack   }
    }
    /**
     * Parser Error
     */
    class ParserError extends PositionBased {
        constructor (message, rule_string, sub_errors) {
            super();
            this.__message = message;
            this.__rule    = rule_string
            this.__sub_err = sub_errors;
        }
        message    () { return this.__message }
        rule       () { return this.__rule    }
        sub_errors () { return this.__sub_err }
        
        is_important (error) {
            return error.token_count > 1;
        }
        filter_error () {
            for (let error of this.__sub_err)
                if (this.is_important(error))
                    return error;
            return this.__sub_err[this.__sub_err.length - 1];
        }
        filter_errors () {
            let array = [ this.filter_error() ]
            return array[0] ? array : []
        }

        toString (depth=0) {
            let prefix = "";
            for (let id_depth = 0; id_depth < depth; id_depth ++) prefix += "\t";

            let string = `${prefix}[RULE: ${this.__rule}]\n`
                       + `${prefix}  ${this.posToString()}\n`
                       + this.showPosition( prefix + "    " ) + "\n"
                       + `${prefix}  ${this.__message}\n`

            let idx = 0;
            
            for (let sub_err of this.filter_errors()) {
                string += sub_err.toString( depth )
            }

            return string;
        }
    }

    /**
     * File object representing a string
     */
    class File {
        constructor (string, name) {
            this.__string = string;
            this.__name   = name;

            this.__lines  = string.split("\n");
        }

        string () { return this.__string; }
        name   () { return this.__name;   }
        getLine (idx, offset=-1) {
            return this.__lines[idx + offset];
        }
    }

    /**
     * List of LexerRule that are used to create tokens from a file string
     */
    class LexerRule {
        start   (lexer) {
            return false;
        }

        makeError (lexer, message) {
            let error = new LexerError( message );

            this.pushState( error, lexer )
            return error;
        }
        saveState (lexer) {
            this.file = lexer.__file;
            this.line = lexer.__line;
            this.col  = lexer.__col;
            this.idx  = lexer.__idx;
        }
        pushState (token, lexer) {
            this.size = lexer.__idx - this.idx;

            token.setPosition( this.file, this.line, this.col, this.idx, this.size );
        }
        string (lexer) {
            return lexer.__string.substring(this.idx, lexer.__idx);
        }
        _compile (lexer) {
            return undefined;
        }
        compile (lexer) {
            this.saveState( lexer );
            let token = this._compile( lexer );
            
            if (token)
                this.pushState(token, lexer);
            else token = this.makeError ( lexer )

            return token;
        }
    }
    class OperandLexerRule extends LexerRule {
        start (lexer) {
            for (let ope of OPERATOR_TREE)
                if (lexer.__char == ope.char)
                    return true;

            return false;
        }
        _compile (lexer, ope_array=OPERATOR_TREE) {
            for (let ope of ope_array) {
                if (lexer.__char !== ope.char) continue ;

                lexer.advance();
                let other = ope.subtokens ? this._compile(lexer, ope.subtokens) : undefined;
                
                if (other !== undefined) return other;

                if (ope.token === undefined) return new LexerError( "Could not parse operand " + this.string(lexer), [  ] );
                return new Token( ope.token, this.string(lexer) )
            }

            return undefined;
        }
    }
    class SkipCharacterRule extends LexerRule {
        constructor (string) {
            super();
            this.characters = string
        }
        start (lexer) {
            return this.characters.includes( lexer.__char )
        }
        compile (lexer) {
            lexer.advance();
            return undefined;
        }
    }
    class ChainCharacterRule extends LexerRule {
        constructor (token_type, inner_string, start_string = undefined) {
            super();
            this.token_type = token_type;

            this.c0 = start_string ? start_string : inner_string;
            this.cn = inner_string;
        }
        start (lexer) {
            return this.c0.includes( lexer.__char );
        }
        _compile (lexer, isRoot=true) {
            let valid = isRoot || this.cn.includes(lexer.__char)

            if (!valid)
                return new Token(this.token_type, this.string(lexer));
            
            lexer.advance();
            return this._compile(lexer, false);
        }
    }

    /**
     * List of rules
     */
    const ALPHABET = "azertyuiopmlkjhgfdsqwxcvbn";
    const LETTERS  = ALPHABET + ALPHABET.toUpperCase()
    const DIGITS   = "0123456789"
    const LEXER_RULES = [
        new OperandLexerRule(),
        new SkipCharacterRule( " \t\r" ),
        new ChainCharacterRule( NAME_TOKEN, LETTERS + DIGITS, LETTERS ),
        new ChainCharacterRule( NUMBER_TOKEN, DIGITS )
    ]
    /**
     * Lexer Object
     */

    class Lexer {
        constructor (file) {
            this.__file   = file;
            this.__string = file.string();

            this.__idx  = -1;
            this.__char = '';
            this.__line = 1;
            this.__col  = 0;
        }

        advance () {
            this.__idx ++;
            this.__col ++;
            this.__char = this.__string[this.__idx];

            if (this.__char === '\n') { this.__line ++; this.__col = 0; }
            
            this.advanced = this.__idx < this.__string.length;
            return this.__char;
        }
        build () {
            if (this.__idx != -1) return [ this.__tokens, this.__errors ];
            this.__tokens = [];
            this.__errors = [];
            this.advance();

            while (this.advanced) {
                let found = false;
                for (let rule of LEXER_RULES) {
                    if (!rule.start(this)) continue ;

                    let data = rule.compile( this );
                    if      (data instanceof Token)      this.__tokens.push(data);
                    else if (data instanceof LexerError) this.__errors.push(data);
                    
                    found = true;
                    break;
                }

                if (!found) {
                    this.__errors.push( new LexerError("Unknown character " + this.__char, [])
                        .setPosition( this.__file, this.__line, this.__col, this.__idx, 1 ));
                    this.advance();
                }
            }

            this.__tokens.push( new Token( EOF, "" ).setPosition( this.__file, this.__line, this.__col, this.__idx, 0 ) )
            return [ this.__tokens, this.__errors ];
        }
    }




    /**
     * Parser, based on the JDromadaire 2.0 implementation
     */
    const COMPILER_CONTINUE_NODE = new Token(-10, "")
    const COMPILER_ERR_NODE      = new Token(-11, "")

    const COMPILER_CONTINUE_BUTHADERR_NODE = new Token(-12, "")

    class ParserCursor {
        constructor (tokens, bypass_errors=false) {
            this.tokens = tokens
            
            this.tok_idx    = 0;
            this.saves      = []
            this.arguments  = [] 
            this.args_saves = []
        
            this.errors   = [];
            this.err_save = [];

            this.config = undefined;

            this.bypass_errors = bypass_errors;
        }
        set_config (config) {
            this.config = config
        }
        args () {
            if (this.args_saves.length == 0) return this.arguments
            return this.arguments.slice(this.args_saves[this.args_saves.length - 1])
        }
        saveError () {
            this.err_save.push(this.errors.length)
        }
        getErrors () {
            let start = this.err_save[this.err_save.length - 1]
            return this.errors.slice( start )
        }
        restoreError () {
            let rst = this.err_save[this.err_save.length - 1];
            this.err_save.pop();

            while (rst < this.errors.length)
                this.errors.pop();
        }
        freeError () {
            this.err_save.pop();
        }
        save () {
            this.saves.push(this.tok_idx)
            this.args_saves.push(this.arguments.length)
        }
        free (found) {
            if (!found) this.restore()
            else if (this.args_saves.length != 0) {
                this.saves.pop();
                this.args_saves.pop();
            }
        }
        get_cur_token() {
            return this.tokens[this.tok_idx] ?? ( new Token(-100, "") )
        }
        restore () {
            if (this.saves.length == 0) {
                this.tok_idx = 0
            } else {
                this.tok_idx = this.saves[this.saves.length - 1];
            }

            if (this.args_saves.length == 0)
                this.arguments.clear();
            else {
                let rst =this.args_saves[this.args_saves.length - 1]
                this.args_saves.pop()

                while (rst < this.arguments.length)
                    this.arguments.pop();
            }
        }
        addArgument (arg) {
            this.arguments.push(arg)
        }
        token_count () {
            return this.tokens.length;
        }
        restore_arguments () {
            if (this.args_saves.length == 0) return ;

            let rst =this.args_saves[this.args_saves.length - 1]
            while (rst < this.arguments.length)
                this.arguments.pop();
        }
        showErrors () {
            for (let error of this.errors)
                console.error(error.toString())
        }
    }

    class ParserRule {
        saveState (cursor) {
            return { __idx_start: cursor.tok_idx };
        }
        saveEndState (state, cursor) {
            state.__idx_end = cursor.tok_idx;
        }
        apply (state, cursor, error) {
            let st_tok = cursor.tokens[state.__idx_start];
            let ed_tok = cursor.tokens[state.__idx_end];

            error.transferPosition( cursor.tokens[state.__idx_start] )
            error.size = ed_tok.size + ed_tok.idx - st_tok.idx;
            error.token_count = state.__idx_end + 1 - state.__idx_start;
        }

        compile (str) {
            return (new RuleCompiler()).compile(str)
        }
        parse (cursor) { throw "Not implemented" }
    }

    class ListRule extends ParserRule {
        constructor (sub_rules) {
            super()
            this.wrapper = undefined;
            this.sub_rules = sub_rules;
        }

        parse (cursor) {
            cursor.saveError();

            let [ state, result ] = this._parse(cursor);
            if (result == COMPILER_ERR_NODE) {
                let sub_errors = cursor.getErrors();
                cursor.restoreError();

                let error  = new ParserError( "Compilation error, could not read token array", this.__name, sub_errors )
                this.apply(state, cursor, error);
                cursor.errors.push(error)
            } else cursor.restoreError();
            return result;
        }
        _parse (cursor) {
            let state = this.saveState(cursor)
            cursor.save();
            for (let sub_rule of this.sub_rules) {
                let object = sub_rule.parse(cursor)

                if (object == COMPILER_ERR_NODE) {
                    this.saveEndState(state, cursor);
                    
                    cursor.restore()
                    return [ state, object ]
                }
            }

            if (this.wrapper) {
                let data = this.get_linked(cursor)

                cursor.restore_arguments()
                cursor.free(true)
                cursor.addArgument(data)

                return [ state, data ];
            }

            cursor.free(true)
            return [ state, COMPILER_CONTINUE_NODE ]
        }
        
        get_linked (cursor) {
            let args = cursor.args()
            return this.wrapper(...args)
        }
        link (wrapper) {
            this.wrapper = wrapper
            return this
        }
    }
    class OptionnalRule extends ParserRule {
        constructor (rule) {
            super()
            this.rule = rule;
        }

        parse (cursor) {
            let object = this.rule.parse(cursor)
            if (object == COMPILER_ERR_NODE)
                return COMPILER_CONTINUE_BUTHADERR_NODE
        
            return object
        }
    }
    class BlockRule extends ParserRule {
        advance_to_valid (cursor, bracketBased) {
            let height = 0;

            while (true) {
                if (cursor.get_cur_token().type() < 0) break;
                if (cursor.get_cur_token().type() == EOF
                 && height <= 0) break;

                if (cursor.get_cur_token().type() == LCURLY_BRACKET) height ++;
                if (cursor.get_cur_token().type() == RCURLY_BRACKET) {
                    height --;
                    if (height < 0)
                        return true;
                }

                cursor.tok_idx ++;
            }

            this.parse(cursor, bracketBased);
            return false;
        }
        parse (cursor, bracketBased=true) {
            let [ state, can_continue ] = this._parse(cursor, bracketBased);
            
            if (can_continue && cursor.bypass_errors) {
                cursor.save();
                this.advance_to_valid(cursor, bracketBased)
                cursor.restore();
            }
        
            return state;
        }
        // TODO fix error handling on "if (1 + 1 {}; function f () { if (1+1) { if (1+ 1) }; if(1 + 1) }""
        _parse (cursor, bracketBased=true) {
            if (bracketBased) {
                if (cursor.get_cur_token().type() != LCURLY_BRACKET)
                    return [ COMPILER_ERR_NODE, false ];
                cursor.tok_idx += 1;
            }

            let nodes = []
            cursor.saveError();
            cursor.save()

            while (cursor.tok_idx < cursor.token_count()) {
                let state = this.saveState(cursor);
                if (cursor.get_cur_token().type() == RCURLY_BRACKET)
                    break

                if (cursor.get_cur_token().type() == EOF) {
                    cursor.tok_idx += 1
                    continue
                }
            
                let final_node = undefined
                for (let rule of cursor.config.get_rule_list()) {
                    let node = rule.parse(cursor)
                    
                    if (node == COMPILER_ERR_NODE) continue ;

                    final_node = node;
                    break;
                }
            
                if (final_node) {
                    nodes.push(final_node)
                    cursor.restoreError()
                    cursor.saveError()
                } else {
                    this.saveEndState(state, cursor);
                    let errors = cursor.getErrors();

                    cursor.restoreError()
                    let error = new ParserError( "Could not compile inner rule", "BLOCK", errors )
                    this.apply(state, cursor, error)
                    cursor.errors.push( error )

                    cursor.restore()
                    return [ COMPILER_ERR_NODE, true ];
                }

                cursor.last_error = []
            
                if ( cursor.tok_idx >= cursor.token_count() 
                 || (
                    cursor.get_cur_token().type() != EOF
                 && cursor.get_cur_token().type() != RCURLY_BRACKET
                 )) {
                    cursor.restoreError()
                    cursor.restore()
                    return [ COMPILER_ERR_NODE, false ];
                }
                
                if ((! bracketBased) && cursor.get_cur_token().type() == RCURLY_BRACKET) {
                    cursor.restoreError()
                    cursor.restore()
                    return [ COMPILER_ERR_NODE, false ];
                }
            }

            cursor.restoreError()

            if (bracketBased) {
                if (cursor.get_cur_token().type() != RCURLY_BRACKET) {
                    cursor.restore()
                    return [ COMPILER_ERR_NODE, false ];
                }
                
                cursor.tok_idx += 1
            }
            
            cursor.restore_arguments()
            cursor.free(true)
            console.error("TODO put nodes inside of BlockNode")
            cursor.addArgument( nodes );

            return [ COMPILER_CONTINUE_NODE, false ];
        }
    }
    class ManyRule      extends ParserRule {
        constructor (rule, times_max, all_needed) {
            super()
            this.rule       = rule
            this.times_max  = times_max
            this.all_needed = all_needed
        }
        parse (cursor) {
            cursor.save()
            let idx = 0
            while (idx != this.times_max) {
                let object = this.rule.parse(cursor)
                
                if (object != COMPILER_CONTINUE_NODE) {
                    if (this.all_needed) {
                        cursor.restore()
                        return COMPILER_ERR_NODE
                    }

                    break ;
                }

                idx ++;
            }

            cursor.free(true)

            return COMPILER_CONTINUE_NODE
        }
    }
    class TokenRule     extends ParserRule {
        constructor (type, add_val, expected_value=undefined) {
            super();
            this.type    = TOKEN_TYPES[ type ];
            this.add_val = add_val;

            this.expected_value = expected_value;
        }

        parse (cursor) {
            if (cursor.get_cur_token().type() == this.type
             && (this.expected_value === undefined || this.expected_value == cursor.get_cur_token().value())) {
                if ( self.add_val ) {
				    if ( cursor.get_cur_token().value() !== undefined )
				    	cursor.addArgument(cursor.get_cur_token().value())
				    else
				    	cursor.addArgument(cursor.get_cur_token().type())
                }

			    cursor.tok_idx += 1
			    return COMPILER_CONTINUE_NODE
            }
            let state = this.saveState(cursor)
            this.saveEndState(state, cursor)

            let token = cursor.get_cur_token()
            let error;
            if (this.expected_value)
                error = new ParserError(`Missing token { type = ${TOKEN_TYPE_BY_ID[ this.type ]}, value = ${this.expected_value} }, found { ${TOKEN_TYPE_BY_ID[ token.type() ]}, ${token.value()} }`, "TOKEN", [])
            else 
                error = new ParserError(`Missing token { type = ${TOKEN_TYPE_BY_ID[ this.type ]} }, found { ${TOKEN_TYPE_BY_ID[ token.type() ]} }`, "TOKEN", [])
            this.apply(state, cursor, error);
            cursor.errors.push(error);
            return COMPILER_ERR_NODE
        }
    }
    class OrRule extends ParserRule {
        constructor (left, right) {
            super()
            this.left  = left;
            this.right = right;
        }
        parse (cursor) {
            cursor.save();

            let object_left = this.left.parse(cursor);
            if (object_left != COMPILER_ERR_NODE) {
                cursor.free(true)
                return object_left;
            }

            cursor.restore()
            return this.right.parse(cursor)
        }
    }
    class ExpressionRule extends ParserRule {
        constructor (stack) {
            super()
            this.stack  = stack
            this.cursor = undefined
        }
        get_cur_token () {
            return this.cursor.get_cur_token()
        }

        parse (cursor) {
            this.cursor = cursor
            cursor.save()

            try {
                let value = this.operator_priority(0)

                this.cursor = undefined
                cursor.free(true)
                cursor.addArgument(value)
                
                return COMPILER_CONTINUE_NODE
            } catch (error) {  }

            this.cursor = undefined
            cursor.free(false)
            return COMPILER_ERR_NODE 
        }
        operator_priority (stack_id) {
            if (stack_id == this.stack.length) return this.factor()
            let types = this.stack[stack_id]

            let left = this.operator_priority( stack_id + 1 )

            while (types.includes(this.get_cur_token().type())) {
                let operand = this.get_cur_token().type()
                this.cursor.tok_idx += 1

                let right = this.operator_priority(stack_id + 1)
                left = new OperatorNode(left, right, operand);
            }

            return left;
        }
        factor () {
            let left_token = this.cursor.get_cur_token();
            let left = this._factor()

            if (left instanceof PositionBased) left.transferPosition(left_token)
            if (this.cursor.get_cur_token() === undefined) return left;

            if (this.cursor.get_cur_token().type() == SET_TOKEN) {
                this.cursor.tok_idx ++
                let right = this.operator_priority(0)

                return new SetNode(left, right)
            }

            return left;
        }
        _factor () {
            return this.factor_term()
        }
        factor_term () {
            let tok = this.get_cur_token()

            this.cursor.tok_idx ++;

            if (tok.type() == NUMBER_TOKEN) return new ConstantNode(new Number(tok.value()))
            
            this.cursor.tok_idx --;
            let error = new ParserError( `Unknown token { ${ TOKEN_TYPES[ tok.type() ] }, ${tok.value()} }`, "EXPRESSION:FACTOR", [] )
            let state = this.saveState(this.cursor);
            this.saveEndState(state, this.cursor);
            this.apply(state, this.cursor, error);
            this.cursor.errors.push(error)

            throw "Token not recognized"
        }
    }

    /*
     * The goal of a ParserRule is to represent a grammar system
     * The parser has a grammar itself and is relying also on the Lexer for rule generation.
     * 
     * '()'    are used to do an operator and to separate things
     * 'EXPR'  is used to propose an expression
     * '|'     is used to propose multiple choices
     * '/X/'   is used to represent the token type X, put //X/ to add the value of the token like name to put it in the stack
     * '[]'    is used to represent an optional part of the grammar 
     * '{}'    is used to symbolize a block of multiple instructions
     * '*'     is used to say you can use as much as you wan't from the last expression, will require at least 1.
     * 
     * An example of this is the IF, ELSE and ELSE IF grammar rule :
     * /IF/ /LPAREN/ EXPR /RPAREN/ {} (([/ELSE/ /IF/ /LPAREN/ EXPR /RPAREN/ {}])*) [/ELSE/ {}]
     * 
     * A second example for a function :
     * /FUNCTION/ /LPAREN/ [/NAME/ (([/COMMA/ /NAME/])*)] /RPAREN/ {}
     */

    class RuleCompiler {
        constructor () {
            this.tokens  = []
            this.tok_idx = -1
        }

        compile (string, name=undefined) {
            this.config = new ParserConfig()
            let file  = new File(string)
            let lexer = new Lexer(file)

            let lexer_data = lexer.build();

            this.tokens = lexer_data[0]
            this.tok_idx = 0;

            let rule      = this._compile();
            rule.__string = string;
            rule.__name   = name ?? string;

            return rule;
        }
        token (offset = 0) {
            return this.tokens[this.tok_idx + offset]
        }

        _compile () {
            let rules = []

            while (this.tok_idx < this.tokens.length) {
                if (this.token().type() == RBRACKET
                 || this.token().type() == RSQUARED_BRACKET)
                    break
                
                let rule = this.factor( rules )
                if (rule !== undefined)
                    rules.push(rule)
                
                this.tok_idx ++;
            }

            return new ListRule( rules );
        }
        factor (rules) {
            if (this.token().type() == NAME_TOKEN
             && this.token().value() == "EXPR")
                return this.config.get_expr_rule()
            
            if (this.token().type() == LBRACKET) {
                this.tok_idx ++;
                value = this._compile();

                if (this.tok_idx < this.tokens.length
                 && this.token().type() != RBRACKET)
                    this.tok_idx -= 1

                return value
            }

            if (this.token().type() == LSQUARED_BRACKET) {
                this.tok_idx += 1
                let value = this._compile()
                if (this.tok_idx < this.tokens.length
                 && this.token().type() != RSQUARED_BRACKET)
                    this.tok_idx -= 1
                return new OptionnalRule(value)
            }

            if (this.token().type() == VERT_LINE) {
                let last = rules.length - 1;
                let left = rules[last]
                
                this.tok_idx += 1
                right = this.factor(rules)
                rules[last] = new OrRule(left, right)
                return undefined;
            }

            if (this.token().type() == DIVIDE_TOKEN) {
                this.tok_idx += 1
                let add_val = this.token().type() == DIVIDE_TOKEN
                if (this.token().type() == DIVIDE_TOKEN)
                    this.tok_idx += 1

                let name = this.token().value()
                let expected_value = undefined
                if (this.tok_idx + 2 < this.tokens.length
                 && this.token(1).type() == SET_TOKEN) {
                    this.tok_idx += 2
                    expected_value = this.token().value()
                }

                if (this.tok_idx + 1 < this.tokens.length
                 && this.token(1).type() == DIVIDE_TOKEN)
                    this.tok_idx += 1

                return new TokenRule(name, add_val, expected_value)
            }

            if (this.token().type() == TIMES_TOKEN) {
                let left = rules[rules.length - 1]
                rules[rules.length - 1] = new ManyRule(left, -1, false)
                
                return undefined
            }

            if (this.token().type() == LCURLY_BRACKET) {
                this.tok_idx += 1
                if (this.token().type() != RCURLY_BRACKET)
                    throw "Expected '}' after '{' in rule compilation"

                return new BlockRule()
            }

            return undefined
        }
    }

    const _RuleCompiler = new RuleCompiler()
    const DROM_EXPRESSION_RULE = new ExpressionRule( [
        [PLUS_TOKEN, MINUS_TOKEN],
        [TIMES_TOKEN, DIVIDE_TOKEN]
    ] )

    class ParserConfig {
        constructor () {
            this.expression_rule = DROM_EXPRESSION_RULE
        }
        get_expr_rule () {
            return this.expression_rule
        }
        get_rule_list () {
            return DROM_RULE_LIST;
        }
    }

    _RuleCompiler.config = new ParserConfig()

    const DROM_RULE_LIST = [
        _RuleCompiler.compile( "/NAME=if/ /LBRACKET/ EXPR /RBRACKET/ {}"
                             +"[/NAME=else/ /NAME=if/ /LBRACKET/ EXPR /RBRACKET/ {}]*"
                             +"[/NAME=else/ {}]", "IF"),
        _RuleCompiler.compile( "/NAME=while/ /LBRACKET/ EXPR /RBRACKET/ {}", "WHILE" ),
        _RuleCompiler.compile( "/NAME=function/ //NAME/ /LBRACKET/ /RBRACKET/ {}", "FUNCTION" ),
        _RuleCompiler.compile( "/NAME=import/ //NAME/ [/DOT/ //NAME/]*", "IMPORT" ),
        _RuleCompiler.compile( "EXPR", "EXPRESSION" ).link((x) => x)
    ]

    function compile ( file, config = {} ) {
        let lexer = new Lexer(file);
        let [ tokens, errors ] = lexer.build()

        if (errors.length != 0 && (!config.bypass_lexer)) return errors;

        let cursor = new ParserCursor( tokens, config.bypass_parser );
        let m_rule = new BlockRule();

        cursor.config = _RuleCompiler.config;
        let result = m_rule.parse(cursor, false);
        
        if (cursor.errors.length != 0) {
            if (config.show_errors) cursor.showErrors();
            return cursor.errors;
        }
        return cursor.arguments[0]
    }

    class Node extends PositionBased {
        evaluate (context) {
            throw "Abstract Node does not have any evaluation function"
        }
    }
    class OperatorNode extends Node {
        constructor (left, right, operand) {
            super();
            this.left    = left;
            this.transferPosition(this.left);

            this.right   = right;
            this.size    = this.right.idx + this.right.size - this.left.idx;
            this.operand = operand;
        }
    }
    class ConstantNode extends Node {
        constructor (value) {
            super()
            this.value = value;
        }
        evaluate (context) { return this.value; }
    }

    return { File, Lexer, RuleCompiler, TokenTypes: TOKEN_TYPES, compile }
} )();

