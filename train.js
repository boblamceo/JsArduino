const lineReader = require("line-reader");
var fs = require("fs");

const gestureClasses = ["violin", "punch"];
let numClasses = gestureClasses.length;

let justFeatures = [];
let justLabels = [];
let numSamplesPerGesture = 21;
let totalNumDataFiles = numSamplesPerGesture * numClasses;
let numPointsOfData = 6;
let numLinesPerFile = 50;
let totalNumDataPerFile = numPointsOfData * numLinesPerFile;

function readFile(file) {
    let allFileData = [];

    return new Promise((resolve, reject) => {
        fs.readFile(`data/${file}`, "utf8", (err, data) => {
            if (err) {
                reject(err);
            } else {
                lineReader.eachLine(`./data/${file}`, function (line) {
                    let dataArray = line
                        .split(" ")
                        .map((arrayItem) => parseFloat(arrayItem));
                    allFileData.push(...dataArray);
                    let concatArray = [...allFileData];
                    if (concatArray.length >= totalNumDataPerFile) {
                        let label = file.split("_")[1];
                        let labelIndex = gestureClasses.indexOf(label);
                        resolve({ features: concatArray, label: labelIndex });
                    }
                });
            }
        });
    });
}

const readDir = () =>
    new Promise((resolve, reject) =>
        fs.readdir(`data`, "utf8", (err, data) =>
            err ? reject(err) : resolve(data)
        )
    );

(async () => {
    const filenames = await readDir();
    let allData = [];
    filenames.map(async (file) => {
        // 75 times
        console.log(file);
        let originalContent = await readFile(file);
        allData.push(originalContent);
        console.log(allData.length);
        if (allData.length >= totalNumDataFiles) {
            format(allData);
        }
    });
    console.log(justLabels);
})();

const format = (allData) => {
    let sortedData = allData.sort((a, b) => (a.label > b.label ? 1 : -1));

    sortedData.map((item) => {
        createMultidimentionalArrays(justLabels, item.label, item.label);
        createMultidimentionalArrays(justFeatures, item.label, item.features);
    });

    // const [trainingFeatures, trainingLabels, testingFeatures, testingLabels] =
    //     transformToTensor(justFeatures, justLabels);

    // createModel(
    //     trainingFeatures,
    //     trainingLabels,
    //     testingFeatures,
    //     testingLabels
    // );
};

function createMultidimentionalArrays(dataArray, index, item) {
    !dataArray[index] && dataArray.push([]);

    dataArray[index].push(item);
}
