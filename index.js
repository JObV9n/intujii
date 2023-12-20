
const findPairWithSum = (nums, target) => {
  const pairs = [];

  nums.map((num, index) => {
    const temp = target - num;
    const tempIndex = nums.indexOf(temp, index + 1);

    if (tempIndex !== -1) { //-1 for not founding index
      pairs.push([num, temp]);
    }
  });

  return pairs;
};

const nums = [8, 7, 2, 5, 3, 1];
const final=findPairWithSum(nums, target);
const target = 10;
if (final.length > 0) {
  final.forEach(pair=>{
    console.log(`Pair found :(${pair[0]} ${pair[1]})`);
  });
} 



