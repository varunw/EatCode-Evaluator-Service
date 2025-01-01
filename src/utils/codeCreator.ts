export default function pythonCodeCreator(startingCode:string,middleCode:string,endCode:string):string{
    return `
    ${startingCode}

    ${middleCode}

    ${endCode}
    `
}