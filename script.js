// Initialize CodeMirror with KJPL mode
const editor = CodeMirror.fromTextArea(document.getElementById("editor"), {
    lineNumbers: true,
    mode: "text/x-kjpl",
    theme: "default",
    indentUnit: 4,
    tabSize: 4
});

// Simple KJPL interpreter
function interpretKJPL(code) {
    const lines = code.split("\n").map(line => line.trim());
    let output = "";
    let variables = {};
    let i = 0;

    while (i < lines.length) {
        const line = lines[i];

        // Variable assignment
        if (line.match(/^[\w]+ =/)) {
            const [varName, value] = line.split(" = ").map(s => s.trim());
            variables[varName] = value.replace(/"/g, "");
        }
        // PRINT statement
        else if (line.match(/^PRINT\(/)) {
            const content = line.match(/PRINT\("(.+)"\)/)?.[1];
            if (content) output += content + "\n";
        }
        // IF statement
        else if (line.match(/^IF /)) {
            const condition = line.match(/^IF (.+) THEN/)?.[1];
            if (evaluateCondition(condition, variables)) {
                i++; // Move to next line (inside IF block)
                continue;
            } else {
                while (i < lines.length && !lines[i].match(/^ENDIF/)) i++;
            }
        }
        // REVELATION_CASE
        else if (line.match(/^REVELATION_CASE /)) {
            const varName = line.match(/^REVELATION_CASE (.+)/)?.[1];
            const value = variables[varName] || "";
            let matched = false;
            i++;
            while (i < lines.length && !lines[i].match(/^ENDCASE/)) {
                if (lines[i].match(/^WHEN /)) {
                    const whenValue = lines[i].match(/^WHEN "(.+)" THEN/)?.[1];
                    if (value === whenValue) {
                        matched = true;
                        i++;
                        output += interpretBlock(lines, i, variables);
                    }
                } else if (lines[i].match(/^ELSE/)) {
                    if (!matched) {
                        i++;
                        output += interpretBlock(lines, i, variables);
                    }
                }
                i++;
            }
        }
        i++;
    }
    return output || "No output.";
}

// Helper to evaluate conditions
function evaluateCondition(condition, vars) {
    const [left, op, right] = condition.split(/ (>=|<=|=|>|<) /);
    const lValue = vars[left] || left.replace(/"/g, "");
    const rValue = vars[right] || right.replace(/"/g, "");
    switch (op) {
        case ">=": return lValue >= rValue;
        case "<=": return lValue <= rValue;
        case "=": return lValue === rValue;
        case ">": return lValue > rValue;
        case "<": return lValue < rValue;
        default: return false;
    }
}

// Helper to interpret a block until ENDIF or next control
function interpretBlock(lines, start, vars) {
    let output = "";
    for (let i = start; i < lines.length; i++) {
        const line = lines[i];
        if (line.match(/^(ENDIF|WHEN|ELSE|ENDCASE)/)) break;
        if (line.match(/^PRINT\(/)) {
            const content = line.match(/PRINT\("(.+)"\)/)?.[1];
            if (content) output += content + "\n";
        }
    }
    return output;
}

// Run button event
document.getElementById("runBtn").addEventListener("click", () => {
    const code = editor.getValue();
    const result = interpretKJPL(code);
    document.getElementById("output").textContent = result;
});