
import moment from 'moment'


class Clendar{
    //переменные всех полей календаря
    protected calendar_body: string | Node | HTMLDivElement;
    private header: HTMLDivElement;
    protected days_field: HTMLDivElement;
    protected previous_month_button:    HTMLDivElement;
    protected next_month_button:    HTMLDivElement;
    protected month_text: HTMLElement;
    public container: Element | HTMLElement;//элемент в который будет встраиваться контейнер

    //переменные дат
    protected cursor_date: string | undefined; //курсор , меняется в зависимости на каком месяце мы находимся, по умолчанию в конструкторе равен текущей дате

    //массивы
    protected days_name: string[];
    protected holydays:[];

    //календарь принимает на входе две переменные - имя класса,в который ему нужно встроиться, если такого нет, то добавляется в body и вторая переменная для отображения номеров недель
    constructor(container_classname:string|null,protected weeks_display:boolean = true){
        this.calendar_body = document.createElement('div');
        this.header = document.createElement('div');
        // @ts-ignore
        this.calendar_body.append(this.header);
        this.days_field = document.createElement('table');
        this.previous_month_button = document.createElement('div');
        this.next_month_button = document.createElement('div');
        this.month_text = document.createElement('text');
        this.days_name = ['Пн','Вт',"Ср","Чт","Пт","Сб","Вс"];
        this.holydays = [];
        if(container_classname){
            this.container = document.getElementsByClassName(container_classname)[0];
        }else {
            this.container = document.body;
        }
        // @ts-ignore
        this.cursor_date = moment().format('MMMM DD YYYY');

    }


    //функция получения дней по  месяцу,принимает дату,возвращает массив дней разбитых на еще 4-5 массива
    protected get_days(month:string){
        const days = []
        // @ts-ignore
        const dateStart = moment(month).startOf('month').startOf('week')
        // @ts-ignore
        const dateEnd = moment(month).endOf('month').endOf('week').subtract(1,'days')
        while (dateEnd.diff(dateStart, 'days') >= 0) {
            days.push(dateStart.format('DD MMMM YYYY'))
            dateStart.add(1, 'days')
        }
        var subarray = []
        for (let i = 0; i <Math.ceil(days.length/7); i++){
            subarray[i] = days.slice((i*7), (i*7) + 7);
        }
        return subarray
    }




    //перерисовка даты
    protected update_date(date:string){
        this.days_field.innerHTML = '';
        var tr = document.createElement('tr'),
            // @ts-ignore
            th,
            days = this.get_days(date);
        this.days_field.append(tr);
        if (this.weeks_display) {
            th = document.createElement('th');
            th.className = 'week_number';
            th.innerText = "№";
            tr.append(th)
        }
        this.days_name.map((item)=>{
            th = document.createElement('th');
            th.className = 'week_days_name'
            th.innerText = item;
            tr.append(th);
        })
        this.month_text.innerText = `${moment(date).locale('ru').format("MMMM YYYY")}`;
        var cur_mon = moment(days[2][2]).format('MMMM');
        // console.log(cur_mon)
        days.map((week)=>{
            tr = document.createElement('tr');
            this.days_field.append(tr)
            if (this.weeks_display) {
                th = document.createElement('th');
                th.innerText = `${moment(week[0]).isoWeek()}`;
                tr.append(th)
            }
            week.map((day_date)=>{
                th = document.createElement('td');
                moment(this.cursor_date).format("DD MMMM YYYY") === day_date? th.className += "target ":console.log();
                this.holydays.map((holiday_date)=>{
                    // @ts-ignore
                    moment(holiday_date).format("DD MMMM YYYY") === day_date? th.className += 'holiday ':console.log();
                })
                // @ts-ignore
                day_date = day_date.split(' ');
                day_date[1]===cur_mon?th.className += 'cur_month':th.className += 'last_month';
                th.innerText = day_date[0];
                th.onclick = () =>{
                    // @ts-ignore
                    this.cursor_date = moment(day_date.join(" ")).format('MM.DD.YYYY');
                    this.update_date(this.cursor_date);
                }
                tr.append(th)
            })
        })

    }
    //возвращает выбранную дату
    public get_cursor_date(){
        return (this.date_to_en_format(moment(this.cursor_date).format('MM.DD.YYYY')));
    }

    //каждое изменение курсора вызывает функцию перерисовки
    protected change_cursor_date(date:string){
        this.cursor_date = date;
        this.update_date(date)
    }

    //переводит строку (DD.MM.YYYY) в формат (MM.DD.YYYY), чтобы moment js мог с ней работать
    protected date_to_en_format(date:string){
        // @ts-ignore

        date = date.split('.');
        return [date[1],date[0],date[2]].join('.');
    }

    //функция для приема праздничных дней,передается массив строк,строка должна быть в формате (DD.MM.YYYY)
    public upload_holidays(arr:Array<string>){
        arr.map((item)=>{
            // @ts-ignore
            this.holydays.push(this.date_to_en_format(item))
        });
    }

    public hide_calendar(){
       // @ts-ignore
        this.container.removeChild(this.calendar_body)
    }

    public set_container(container: Element | HTMLElement){
        this.container = container;
    }

    public get_calendar_body(){
        return this.calendar_body;
    }
    //показывает календарь, если передается дата,которую нужно отрисовать то формат строго дд.мм.гггг
    public draw_calendar(date:string|null){
        this.container.append(this.calendar_body);
        // @ts-ignore
        this.next_month_button.onclick = () => this.change_cursor_date(moment(this.cursor_date).add(1,'month'));
        // @ts-ignore
        this.previous_month_button.onclick = () => this.change_cursor_date(moment(this.cursor_date).subtract(1,'month'));
        this.header.append(this.previous_month_button,this.month_text,this.next_month_button);
        // @ts-ignore
        this.calendar_body.append(this.days_field);
        // @ts-ignore
        this.calendar_body.className = 'calendar';
        this.header.className = 'calendar_header';
        this.days_field.className = 'days_table';
        this.next_month_button.className = 'next_month_button';
        this.previous_month_button.className = 'prev_month_button';
        this.next_month_button.innerText = '>';
        this.previous_month_button.innerText = '<';
        this.month_text.className = 'month_text'

        if(date){
            moment(date).format()=='Invalid date'?this.cursor_date = this.date_to_en_format(date):console.log();
        }

        // @ts-ignore
        this.update_date(this.cursor_date);
        // this.calendar_body.style.cssText = 'width:25%';
        this.header.style.cssText = 'display:flex'
        this.month_text.style.cssText = "flex-basis:10%;text-align:center"

    }
}






// var kek = new Calendar();
//
// document.getElementsByClassName('show')[0].onclick = () =>{
//     console.log()
//
//     kek.upload_holidays(['2.13.2020','2.2.2020','2.3.2020'])
//     kek.draw_calendar(document.getElementsByClassName('input')[0].value);
//     document.getElementsByClassName('input')[0].value = kek.get_cursor_date()
//     document.getElementsByClassName('calendar')[0].addEventListener('click',()=>{
//         document.getElementsByClassName('input')[0].value = kek.get_cursor_date()
//     })
//     console.log(kek.get_cursor_date())
// }
//
//
// document.getElementsByClassName('hide')[0].onclick = () =>{
//     kek.hide_calendar()
// }
//
//
//



export default class Calendar{
    //переменные всех полей календаря
    protected calendar_body:  HTMLDivElement;
    private header: HTMLDivElement;
    protected days_field: HTMLDivElement;
    protected previous_month_button:    HTMLDivElement;
    protected next_month_button:    HTMLDivElement;
    protected month_text: HTMLElement;

    //переменные дат
    protected cursor_date: string | undefined; //курсор , меняется в зависимости на каком месяце мы находимся, по умолчанию в конструкторе равен текущей дате

    //массивы
    protected days_name: string[];
    protected holydays:[];
    protected weeks_display: boolean = false;


    constructor(){
        this.calendar_body = document.createElement('div');
        document.body.append(this.calendar_body);
        this.header = document.createElement('div');
        this.days_field = document.createElement('table');
        this.previous_month_button = document.createElement('div');
        this.next_month_button = document.createElement('div');
        this.month_text = document.createElement('text');
        this.days_name = ['Пн','Вт',"Ср","Чт","Пт","Сб","Вс"];
        this.holydays = [];
        this.cursor_date = moment().format('MMMM.DD.YYYY');
        this.calendar_body.className = 'calendar';
        this.header.className = 'calendar_header';
        this.days_field.className = 'days_table';
        this.next_month_button.className = 'next_month_button';
        this.previous_month_button.className = 'prev_month_button';
        this.next_month_button.innerText = '>';
        this.previous_month_button.innerText = '<';
        this.month_text.className = 'month_text'
        // @ts-ignore
        this.next_month_button.onclick = () => this.change_cursor_date(moment(this.cursor_date).add(1,'month'));
        // @ts-ignore
        this.previous_month_button.onclick = () => this.change_cursor_date(moment(this.cursor_date).subtract(1,'month'));
        this.header.style.cssText = 'display:flex'
        this.month_text.style.cssText = "flex-basis:10%;text-align:center"
    }

    protected update_date(date:string){
        this.days_field.innerHTML = '';
        var tr = document.createElement('tr'),
            // @ts-ignore
            th,
            days = this.get_days(date);
        this.days_field.append(tr);
        if (this.weeks_display) {
            th = document.createElement('th');
            th.className = 'week_number';
            th.innerText = "№";
            tr.append(th)
        }
        this.days_name.map((item)=>{
            th = document.createElement('th');
            th.className = 'week_days_name'
            th.innerText = item;
            tr.append(th);
        })
        this.month_text.innerText = `${moment(date).locale('ru').format("MMMM YYYY")}`;
        var cur_mon = moment(days[2][2]).format('MMMM');
        // console.log(cur_mon)
        days.map((week)=>{
            tr = document.createElement('tr');
            this.days_field.append(tr)
            if (this.weeks_display) {
                th = document.createElement('th');
                th.innerText = `${moment(week[0]).isoWeek()}`;
                tr.append(th)
            }
            week.map((day_date)=>{
                th = document.createElement('td');
                moment(this.cursor_date).format("DD MMMM YYYY") === day_date? th.className += "target ":console.log();
                this.holydays.map((holiday_date)=>{
                    // @ts-ignore
                    moment(holiday_date).format("DD MMMM YYYY") === day_date? th.className += 'holiday ':console.log();
                })
                // @ts-ignore
                day_date = day_date.split(' ');
                day_date[1]===cur_mon?th.className += 'cur_month':th.className += 'last_month';
                th.innerText = day_date[0];
                th.onclick = () =>{
                    // @ts-ignore
                    this.cursor_date = moment(day_date.join(" ")).format('MM.DD.YYYY');
                    this.update_date(this.cursor_date);
                }
                tr.append(th)
            })
        })

    }



    protected change_cursor_date(date:string){
        this.cursor_date = date;
        this.update_date(date)
    }

    public get_calendar_body(){
        return this.calendar_body;
    }

    public hide_calendar(){
        // @ts-ignore
        this.calendar_body.removeChild(this.header,this.days_field);
    }

    public draw_calendar(date:string|null){
        this.header.append(this.previous_month_button,this.month_text,this.next_month_button);
        this.calendar_body.append(this.header);
        this.calendar_body.append(this.days_field);
        // @ts-ignore
        // @ts-ignore
        // @ts-ignore



        // @ts-ignore
        // this.update_date(this.cursor_date);

    }
}



