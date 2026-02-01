
const transactionContent = "MUSA 697e3bf8501458330701f534";
const match = transactionContent.match(/MUSA\s*[:_]?\s*([a-fA-F0-9]{24})/i);

if (match) {
    console.log('Match Success!');
    console.log('Extracted ID:', match[1]);
} else {
    console.log('Match Failed!');
}

const content2 = "Chuyển tiền MUSA:697e3bf8501458330701f534 cực nhanh";
const match2 = content2.match(/MUSA\s*[:_]?\s*([a-fA-F0-9]{24})/i);
if (match2) {
    console.log('Match 2 Success!');
} else {
    console.log('Match 2 Failed!');
}
