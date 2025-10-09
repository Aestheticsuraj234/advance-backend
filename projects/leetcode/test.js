const referenceSolutions = {
  JAVA: 'import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        if (n > 0) {\n            System.out.println("Positive");\n        } else if (n < 0) {\n            System.out.println("Negative");\n        } else {\n            System.out.println("Zero");\n        }\n    }\n}',
  PYTHON:
    "n = int(input())\nif n > 0:\n    print('Positive')\nelif n < 0:\n    print('Negative')\nelse:\n    print('Zero')",
  JAVASCRIPT:
    "const readline = require('readline');\nconst rl = readline.createInterface({ input: process.stdin, output: process.stdout });\nrl.on('line', (line) => {\n    const n = parseInt(line);\n    if (n > 0) {\n        console.log('Positive');\n    } else if (n < 0) {\n        console.log('Negative');\n    } else {\n        console.log('Zero');\n    }\n    rl.close();\n});",
};


console.log(Object.entries(referenceSolutions))