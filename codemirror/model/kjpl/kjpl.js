CodeMirror.defineMode("kjpl", function() {
    return {
        startState: function() {
            return { inBlock: false };
        },
        token: function(stream, state) {
            // Skip whitespace
            if (stream.eatSpace()) return null;

            // Keywords
            const keywords = /^(DECLARE|IF|THEN|ELSE|ENDIF|FOR|TO|DO|ENDFOR|WHILE|ENDWHILE|DEFINE|AS|FUNCTION|ENDFUNCTION|TRY|CATCH|ENDTRY|PARABLE|ENDPARABLE|REVELATION_CASE|WHEN|ENDCASE|PRINT)/i;
            if (stream.match(keywords)) return "keyword";

            // Strings
            if (stream.match(/^"[^"]*"/)) return "string";

            // Variables
            if (stream.match(/^[A-Za-z_]\w*/)) return "variable";

            // Operators
            if (stream.match(/^(>=|<=|=|>|<|\+|-|\*|\/)/)) return "operator";

            // Skip to next token
            stream.next();
            return null;
        }
    };
});

CodeMirror.defineMIME("text/x-kjpl", "kjpl");