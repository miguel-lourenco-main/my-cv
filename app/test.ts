function numOfUnplacedFruits(fruits: number[], baskets: number[]): number {
    let placed = 0
    let basketsS = baskets

    for( let fruit of fruits ){

        const lastIndex = basketsS.length - 1
        
        for (let i = 0; i < lastIndex; i++){
            if(fruit >= basketsS[i]){
                placed++
                if(i < lastIndex) basketsS = [...basketsS.slice(0,i - 1), ...basketsS.slice(i + 1, lastIndex)]
                continue
            }
        }
    }

    return fruits.length - placed
};