document.getElementById('calcPercentage').addEventListener('click', () => {
    const ele = document.getElementsByName('server_options');
    const sq = document.getElementById('SQAmount').value;
    const tickets = document.getElementById('TicketAmount').value || 0;
    const percentage = document.getElementById('projected-percentage');

    for(i = 0; i < ele.length; ++i) {
        if(ele[i].checked) {
            var server = ele[i].value;
        }
    }

    const rate_up = (server == 'na' ? 0.007 : 0.008);
    const rolls = Math.floor(sq / 3) + parseInt(tickets) + (server == 'na' ? 0 : Math.floor((Math.floor(sq / 3) + parseInt(tickets)) / 10));
    
    percentage.value = (1 - Math.pow((1 - rate_up), rolls)) * 100;
})