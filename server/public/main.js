/**
 * Let R = # of rolls, P = % of probability
 * Percentage of rolling a 5* given a number of rolls:
 * P = 1 - (1 - .03)^(R)
 * 
 * Number of rolls to achieve a given probability:
 * R = (ln(1 - (P)) / ln(1 - .03))
 */

let calc_perc = document.getElementById('calcPercentage')
if(calc_perc) {
    addEventListener('click', () => {
        const ele = document.getElementsByName('server_options_1');
        const sq = document.getElementById('SQAmount').value;
        const tickets = document.getElementById('TicketAmount').value || 0;
        const percentage = document.getElementById('projected-percentage');
    
        for(i = 0; i < ele.length; ++i) {
            if(ele[i].checked) {
                var server = ele[i].value;
            }
        }
    
        const rate_up = (server == 'na' ? 0.007 : 0.008);
        console.log(server)
        const rolls = Math.floor(sq / 3) + parseInt(tickets) + (server == 'na' ? 0 : Math.floor((Math.floor(sq / 3) + parseInt(tickets)) / 10));
        
        percentage.value = (1 - Math.pow((1 - rate_up), rolls)) * 100;
    });
}


let calc_rolls = document.getElementById('calcRolls')
if(calc_rolls) {
   addEventListener('click', () => {
        const ele = document.getElementsByName('server_options_2');
        const percentage = document.getElementById('percentage').value;
        const num_rolls = document.getElementById('projected-rolls');
    
        for(i = 0; i < ele.length; ++i) {
            if(ele[i].checked) {
                var server = ele[i].value;
            }
        }
        const rate_up = (server == 'na' ? 0.007 : 0.008);
        console.log(server)
        const rolls = Math.ceil(Math.log((1 - (parseFloat(percentage) / 100))) / Math.log((1 - rate_up)));
        num_rolls.value = rolls;
    })
}

function display(x) {
    if(x == 0) {
        document.getElementById('percentage-form').style.display='block';
        document.getElementById('roll-form').style.display='none';
    } else if(x == 1) {
        document.getElementById('percentage-form').style.display='none';
        document.getElementById('roll-form').style.display='block';
    }
}
