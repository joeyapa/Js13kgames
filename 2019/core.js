/* 
	Simple platformer 
*/
var canvas,
	context, 
	canvaswidth=400, 
	canvasheight=600; 

/** @type Array<Component> */
var components = [];

var World = {
	friction:0.0,
    gravity:0.4,
    viewportx:0,
    viewporty:0,
    moving:1, // flag to say that the world is moving / scrolling
    state:0, // 0:start 1:play 2:gameover
    enemyspawn:0,    
    majorbase:10,
    majorspawn:10,
    timer:0,
    showwarning:0
};

var Player = {
	hp:100,
	x:380,
	y:0,	
	vx:1,
	vy:1,
	damage:1,
	sprite:0,
	width:64,
	height:64,
	yspeed:6,
	jumpingcd:6,
	jumping:0,
	grounded:0,
	steady:1,
	cooldown:0,
	points:0,
	missletype:1
};

var Enemy = {
	hp:2,
	x:0,
	y:-200,
	vx:0,
	xspeed:-1,
	vy:0,
	yspeed:0,
	width:50,
	height:50,
	bullet:1,
	enemy:1,	
	damage:20,
	cost:200
};

var Missle = {
	sprite:0,
	spritearray:[],
	xspeed:20,
	vx:0,
	width:64,
	height:64,
	bullet:1,
	playerbullet:1,
	pushback:10,
	damage:1
};

var Explosion = {
	sprite:0
};

var Background = {
	sprite:[]
};

var Assetpack = 
	"ffffffead4aae8b796c28569b86f50e4a672d77643be4a2f733e393e2731a22633e43b44ff0044f6757ab5508868386cf77622feae34fee76163c74d3e8948265c42193c3e124e890099db2ce8f5c0cbdc8b9bb45a69883a4466262b44181425" // [0] pallete
	+"~BDNIJKL" // [0-6] font color sets
	+"~!!er'!dr,!dr1!dr6!dr;!dr%#n)#k4#l#$d($d7$<$c*%r(&d-&c2&c7&c#'d4'?'o3(<(>(c$)c()d2)=)%*r3*!+er'+q,+r1+p4+l6+em;+k(,d-,d2,d7,d<,e#-/-k=-n$.c*.l-.d2.c7.d4/k9/k(0d60el1eo+1ck01cm51c:1fk2dn2242>23cm%3l(3k*3k.3k337393<3c4l!4q,4244484l;4p#5d)5k-5k/5r15m55<5dk'6e,6e46r66el=6c*7k'8eq-8d28d78d<8d99k>9k(:dk,:em6:e<:d#;d);c-;d1;en<k%<*<m7<l$=(=d-=d6=d;=d#>k/>k(?d,?e2?d" // [2] font			
	+"~D9.E$'+'-*),k2/<0c12k42%7F*)0.c:.;03124c15*7$8G:/c2314I</J#'$(k))).2.3/8/90c>032k43*4-545$7+8k$9K#&d+&d*(/*$+,+k1+l-,f$-/-d9-%.&/ek20c81?162>2$4)444.50525c-6l)7*8#9%9Q-+*-S9/21kV)+c1/40k91W51X3-6-c4../)0c10(1+5&7Y%'&(o')n%*ek(+l++%-e,.d5.k7.&1cm)1il>1%2dl*2h:2c'3dk+3g(4.4c&6d'7&8^%)7072c_*./.11:1c+4`$,*,c3.8.+/c0/6/c,05080%1<1c$2k*3,4ck%6%8a&','cm%('(()+)ck**d.*k2+ek%,4,k+-k.-5-8-&.d6.*/-/k//k4/'0+0.0d71(2<2ck04%5f/5)6e+7c'8,8b+(-(k)*/+c6+k3,5,e,-c2-(060k52l92k63gk=374*5(7&9,9cu9." // [7] main ship
	+"~J)0kK)/,/f2/c+0L+/(0*0Q4/20R=.</?/S<.>.@/T=/cl].0e^-0_5/c,0`1/7/9/30ca8/b9.c-1*/B51dJ-10121L.1cM*1dQ:0R@0<1?1=2SA0@1<2>2T<0e>1]41^50d9011_31`80a81b:/c;0k:1ck92c" // [8] missle
	+"~R/$4$0%5%1&6&,'c2'7'-(c.)c2)c/*c3*c)+0+c4+c(,*,1,c5,ck)-+-2-c6-dk'.*.,...k3.c8.c(/+///7/9/c$0)000c4080:0c%1*111c51k91k&2(2,222f:2k'3)333c63c;3k(4*4,4l04c4474c<4k'5)5+5d2585c=5&6(6*6-6dk3696c'7)7+7.7dm47&8(8*8k/8ep58cr'9)9c09hp(:+:1:fp);,;2;fp-<3<fo4=fo;=6>fk7?c5AkS2&d1'm3'dk0(hk4)e2*k5*d-+dl3+k6+d,,f4,k7,d.-e9-e+./.e5.l7.:.e'/,/cl0/h8/</d(0+0f20c60ck90=0d)1-1em31c71ck:1d*2ck.2em82k;2=2+3ik53n93k>3m/4k24c64m?4m05ck35f:5@5m16ck46f;6nA627c77h38c88hn79cl:9g6:e<:ek9;cl=;:<ckT1!m3!cm.#j($+$d0$e5$d)%co,%ek2%d6%d:%c(&jn5&7&d;&c''fp.'d6'8'dk<'c&(hn7(f=($)h,)cl9)e>)cm%*jk.*8*:*d*+d9+;+gk#,co),+,<,f$-cl(-k*-,-=-?-l!.fk).k-.>.d%/ck*/k;/@/ck'0l<0$1k&1d+1=1c!2%2k)2>2cA2#3n&3k<3c?3c$4n'4:4=4@4!5e(5*5;5%6n'6)6+6<6(7*7,7m)8+8dk78&9l(9-9l99):c::';k*;c.;p;;(<ck+<c<<)=ck,=dm*>f;>+?f/@6@d0Akccdc" // [9] explosion
	+"~X<)p)*ck7*;*c?*co!+m&+fo.+cm2+cm>+cm%,dn,,jl5,ck9,flA,c#-jm--jl6-il$.jl0.fl7.h'/fl1/3/c:/i+0c/0cl205090k;0=0@0ck(1c,11171k?1c+2k-262d:2Y!&%&l1&o4&l9&$'cl''3'ck6'@'#(dk)(+(.(2(d8(k;(k&)k7)c:)cA)k'*/*3*9*%+4+7+;+8,A-k5/?081,292]!$)$c.$c2$4$dk;$>$c(%+%c1%3%c8%d@%#&c-&/&7&=&cA&8'^&$k!%%%c)%-%c0%2%;%l'&c5&<&l?&k-'9'k>'c/(7(:(=(k@(.)6)$*k:*_/%5%d?%&&l)&ek0&n2&c8&:&k@&#'+'c.'d7'='A'*(k,(l5(cl?(k%)k()f/)c2)k9)@)#*k+*e8*k=*c-+9+$,7,@,l`!'m('k*'2'5'm'(ck-(k>(kA(c3)c(*4*6*k++ck0+5+c:+=+@+c#,(,e>,l/.k5.,/2/(0-0k1060:0>0.1:3b!/r./k7/dkr)0c30cr80<0r#1er*1cr01r21fr:1fA1cr$2hr.2r12fr;2ir%3gr,3jr53fr=3gr&4jr/4jr84jr'5jr45jr>5fr(6jr66jr?6er)7jr77jr@7dr!8jr+8jr98jrr-9jr:9jr#:jq0:jq<:hq$;jp.;jp;;ip%<jo1<jo=<go&=jn/=jn8=jnA=cn'>jm2>jm>>fm(?jl3?jl??el)@jk4@jk@@dk!Aj+Aj5Aj" // [10] grass	
	+"~C/(,-+/k:0l*2k+3<3(4k)5'708&;-=.>_2$cn1%dl3&dl4'c0(5(c,).)cm1)q6)+*/*ek7*k-+il,,d0,gm8,k+-k/-ik9-k,.k2.gn./r3/k6/d:/)0c-0dr70cr*1c/1cr81cn+2j42gl)3k,3gr33i=3k*4jr54hr>4p+5jr65hr(6jr16hr96h)7jr27hr:7gr&8il38jr<8f'9jr09jr99dk=9f-:jl;:cr?:e%;p.;jl7;p<;cr@;er$<jo/<jl8<jpA<dq#=jl,=p4=jp==hp&>in5>jo>>go!?jl+?em1?jn??fn(@jl2@jmm#Aj-Ajm6Ajlljhkjkfj`3#c4$k0%k5%c6&k.'ck7'l-(cl8)l,*ck++ck9+k*,ck:,l)-cl;.m(0m<0=1k<2d'3cm>3?4k@5l&6ckA7%8l$:ck#;ck!=k" // [11] mountain 1
	+"~C:0l*2k+3<3(5c'708&;-=.>_4&5(c6)0*c1,4,cl8,k--0-2-el+./.1.cl5.d9.,/0/e6/8/p:/)0.0cq70c-1er91o+2j42gl,3gr33i=3k)4j24r54hr>4p*5jr35r65hr)6jr46er:6fr(7jr17ir;7fr&8il/8p78jk@8r'9jr09jr99dk=9f+:jr<:r?:e%;p-;jk7;p=;rA;dr$<jo.<jk8<jpcq#=jl,=p2=jp>=gp&>in3>jo?>fo!?jl-?co4?jn(@jl1@jm:@jm#Aj.Ajl9Ajlljhkjkdi`4'l5)k7)6*m4+7+9+2,c:,1-;-n?-k).k0.3.:.h+/l./c7/=/c@/co(0n*0ck-020fk<0>0mA0m)1dl11c4171=1fk<2d'3dm&4dk?4ck%5doA5!7m&7@7c#8$9cl#:dl!=ka3'n2)cl8)c7*9*c++jl:+.,;,*-dk<-d$6&6(6#7$8b,,c" // [12] mountain 2
	+"~]$'c*'c%(+(',(-=-ck>.$1c%2=3ck>4/7ck37k67c0878$9ck=9ck>:0=k3=6=ck=?ck>@^-&l$(*(,*++(,*,'-+-*.*0$2*268%:/=k3>7>_-%-)+**+,+6+cl=+d+,7,gl?,r*-8-fl9.el6/:/gkA/r70;0f6181<1er72=5dl>6ck?7rA8r<:q=;dl><ck?@k=AdkAA`$$j-*q,,co+.dm6.*/e7/6080*1e716282:2r*3r-4jr64fl.5jr75ek/6j86dr17cr47cr97cr28r58r/9jm0:jl3;ik*<p6<f-=cn:=p.>m/?jl8?do0@jk9@cl1Ajkdkfcca-$.%r=,c..n+2er=2c=8c+;p=>cb!#jr+#e#$r.$$%jk/%r%&i&'er,'l'(dm$)jq%*gp6*d=*d(+c5+r8+f@+r!,fr),r#-er'.dr/.oA.(/cr&0er91dl;2r$3go,3jr63e%4fn@4r!5ir#6hr'7dr(8cr&9er):r$;gr;;p%<fr,<o@=n!>im#?hm'@dl(Aclelck" // [13] building 1
	+"~]1'c7'c2(8(c11c'222ck&6<7ck@7kc=819ckck!<'<==k@=ck#?&?cck^:&l1(7(1,ck2-1225162:<=k@>1?ck2@_:%:)cld7,ckgkk8-firh!1ck&1ck71cker#2rdl!6ck'6k+6eck#7&7cr.9q!;c&;ckdl#<ck,=n!?k#@&@cdk`1$jk2%i4&cr9&r5'cr1)jk2*j3+er:+p6,r1.jk2/j!0f(0r40dr90ck%151cl$2rr!3hk73r#4gk14ek:4jrfl%5r35cr65c;5jrek26dk<6jdr17e67c>7crA7crcr!8hl?8rr#9g,949r69cr<9jm&:d=:jl$;cr(;p,;.;1;el@;ik2<dk7<pf!=h.=:=cnp%>p3>cm;>m,?.?<?jldo=@jkcl!Ah1Ae>Ajkfdkfccca0$r:$;%r6&1+c7+cc0-r!/i;/m'0)0r70c$1%282erc54r!5&5c06r66+8er68c)9r-9r#:,:d8;p,<d5=o!>c&>c,>d1>cc0?l,@dk+Aecb/#jr8#e;$<%r1&d7&c3'k6(ddrfr/,r!.j;.cjd*/r</n10cdlr13c93jrer/5r+7f*8r18cp9<on/>m*Aelddc" // [14] building 2
	+"~]'c'c((:,ck,-c;-20l1c31k61ck:1ck2272;2,3ck-4626ck66ck:6ck7ck!7k%7c3777;78&89ck,9ck-:<<=k!=%=ck2=ck7=k:=k3>6>c;>??c,?ck-@^&l((,ck-256%8:=k!>&>?ck@_%)7*go%+cl,+d6+en<+cr,ck&,gk.,k8,r=,cr-'-f9-r>-r:.fk%/'/i0/jr;/e&0(0h10r40cr1ck1ck1ck%1'1+1er51r2&2.2r23jk;3ek34j<4dr,5dl85cr=5cr6ck6k6e-6ck96r>6r77c08cr38jm919jr:9fl+:q2:jk;:ek;c;ck,;dl4;jr<-<ck5<r=.=n;=e8>co<>do?k2?n6?jl@@c3@jn=@cn,Adk0Aj9Agmfjkclck`$jk%i&cr&r'cr)jk*j+er+p:+c,r9,.jk/j&/0f0r0dr0ck%0'03060c:0c11cl&12r%2'2)2r3hk3r4gk4ek4jr%4fl5r5cr5c5jr&5ek25c65c:5c6dk6j'6dr7e7c7cr#7cr(7cr8hl8r$8r289g99r9cr9jm:d:jl;cr;p;;;el!;ik<dk<p%<f2<c6<ck:<c=h==cn)=p>p>cm>m???jl'?do3?@jk(@clAhAeAjkfdkfccca$r$%r&+c+c,,c-r/i/m00r0c122er,2c4r55c6r68er8,8c9r9r::d;p<d=o>c>c>d>c,>c?l@dkAecb#jr#e$%r&d&c'k(6)ik%*d,*d=*$+r'+f/+r5+m>+c,r?,r.j.c%.j..i/r/n0c(1dl*2r3c3jr%3e/4r5r?5r7f8r8c*;p<o/=n>m?>mAelddc" // [15] building 3
	+"~M$#cm)#cn#$ek($en%%hl&&fl''dl" // [16] heart
	+"~L%(k&)k'*M%cm*cn$ek)en&hl'fl(dl]*#d)$,$k'&+&)(^*$(%ck+%*&k'')'c((_+$*%)&&'k(''(k()b%'$*ck(*%+" // [17] attack
	+"~B(%k()'*R%#e$$)$#%o*%o$+)+%,eS%$($$%o)%o(*ck%+eT&$cp%%do'&m('k" // [18] coin
	+"~M!!$!&!(!*!,!.!0!2!4!6!8!:!<!>!@!##%#'#)#+#-#/#1#3#5#7#9#;#=#?#A#b#!%!'!)!+!-!/!1!3!5!7!9!;!=!?!A!!#$#&#(#*#,#.#0#2#4#6#8#:#<#>#@#" // [19] warning   
	+"~S*!io:!io+#hn;#hn,$gm<$gm-%fl=%fl.&ek>&ek/'d?'dT!!io2!io##hn3#hn$$gm4$gm%%fl5%fl&&ek6&ek''d7'd" // [20] warning cover
	+"~B..+/c1/c*0n,0c+1n41,6.6F67K55P.,+-5-c).'/&0&4'547cQ-,/,5.k80c=1c>2:3c74)656+717d-808Z52dk33dk24c[-/e+0.0fo,1i-2in,3hl/4d])/o(0cn'1dl*5^,-dk*.ek/.e(/'030e&1l51g82e'4(5c/5ek+616e-7c/8_/-g3.ck4/70;1c<2c63e44c35*606,7/7.8`644507"// [21] missle 2
	+"~|*,,,,,,,,bl" // [0] grass tilemap
	+"~|*-.---.-.bl" // [1] grass tilemap
	+"~|*/01/01/0bl" // [2] grass tilemap

	;




/**
 *	@constructor
 *	@param {Component|{x:(number|undefined),y:(number|undefined),gid:(number|undefined),width:(number|undefined),height:(number|undefined),bullet:(number|undefined),xspeed:(number|undefined),yspeed:(number|undefined),repeat:(number|undefined),sprite:(Sprite|undefined),vx:(number|undefined),vy:(number|undefined),enemy:(number|undefined),hp:(number|undefined),cost:(number|undefined),text:(string|undefined),solid:(number|undefined),damage:(number|undefined),fadeout:(number|undefined),pushback:(number|undefined)}=} option
 */
function Component(option){ 
	this.x=0; 
	this.y=0;
	this.gid=0;
	this.width=64;
	this.height=64;
	this.bullet=0;
	this.xspeed=0;
	this.yspeed=0;
	this.repeat=0;
	this.sprite = option&&option.sprite?option.sprite:null;
	this.vx=0;
	this.vy=0;
	this.enemy=0;
	this.hp=0;
	this.cost=0;
	this.text=null;
	this.solid=0;
	this.damage=0;
	this.fadeout=null;
	this.pushback=null;
	this.fixed=0;
	this.siny=0;
	this.sinyt=0;

	if(option) this.set(option);
}

/**
 *	@param {Component|{x:(number|undefined),y:(number|undefined),gid:(number|undefined),width:(number|undefined),height:(number|undefined),bullet:(number|undefined),xspeed:(number|undefined),yspeed:(number|undefined),repeat:(number|undefined),sprite:(Sprite|undefined),vx:(number|undefined),vy:(number|undefined),enemy:(number|undefined),hp:(number|undefined),cost:(number|undefined),fixed:(number|undefined)}=} option
 */
Component.prototype.set = function(option){
	for (let k in option) this[k] = option[k];	
}

/**
 *	@param {Component|{x:(number|undefined),y:(number|undefined),gid:(number|undefined),width:(number|undefined),height:(number|undefined),bullet:(number|undefined),xspeed:(number|undefined),yspeed:(number|undefined),repeat:(number|undefined),sprite:(Sprite|undefined),vx:(number|undefined),vy:(number|undefined),enemy:(number|undefined),hp:(number|undefined),cost:(number|undefined)}=} option
 */
Component.prototype.clone = function(option){
	let c = new Component(this);
	if(option) c.set(option);
	return c;
}


/**
 *	Initialize game
 */
window.addEventListener('load',function(){
	// 1. define the canvas section
	log('Starting Core');

	document.addEventListener("contextmenu", function(e){ e.preventDefault(); }, false);

	canvas = document.getElementById('c');
	context = canvas.getContext('2d');
	canvas.width = canvaswidth; 
	canvas.height = canvasheight;

	// 2. adjust the canvas dimension to the screen
	let w = window.innerWidth;
	let h = window.innerHeight;	
	canvas.style.height = h+'px';		
	canvas.style.width = (( h*4/6 > w ) ? w : h*4/6)+'px';
	canvas.style.background = '#C0CBDC';

	// 3. create the assets to be cached in memory
	Assets.init();

	// 4. 
	timeout(function(){

		Assets.pallete = [];
		Assets.fontlist = [];
		Assets.spritelist = []; 
		Assets.tilemaplist = [];
		Assets.init();

		Player.sprite = Assets.spritelist[7];

		Missle.spritearray.push(Assets.spritelist[8]);
		Missle.spritearray.push(Assets.spritelist[21]);
		Missle.sprite = Missle.spritearray[0];

		Explosion.sprite = Assets.spritelist[9];

		Background.sprite.push(Assets.tilemaplist[0]);
		Background.sprite.push(Assets.tilemaplist[1]);
		Background.sprite.push(Assets.tilemaplist[2]);

		/* farground components */
		let fg = {};

		/* background components */
		let bg = new Component({gid:0,x:0,y:-120,width:768,height:768,bullet:1,xspeed:2,repeat:1,sprite:Background.sprite[2]});
		components.push(bg.clone());
		components.push(bg.clone({x:768})); 

		/* floor components, switching */
		let fr = new Component({gid:1,x:0,y:-50,width:768,height:768,solid:1,bullet:1,xspeed:8,repeat:1,sprite:Background.sprite[0]});
		components.push(fr.clone()); 
		components.push(fr.clone({x:768}));

		//components.push({x:0,y:-420,width:800,height:60,color:'#666',bullet:1,xspeed:5,repeat:1}); 
		//components.push({x:800,y:-420,width:800,height:60,color:'#676',bullet:1,xspeed:5,repeat:1});		

		/* Heads on display, heart sword and coin */
		components.push(new Component({x:30,y:12,fixed:1,sprite:Assets.spritelist[16]}));
		components.push(new Component({x:145,y:10,fixed:1,sprite:Assets.spritelist[17]}));
		components.push(new Component({x:260,y:10,fixed:1,sprite:Assets.spritelist[18]}));


		


		Update();			
		Controls();
	});

	
	
			
	// 5. Global interval listener
	setInterval(function(){
		if(Player.cooldown>0) Player.cooldown--;
		World.timer++;
	},100);
	

});


// 1 second timeout function
function timeout(f){ return setTimeout(f,999); }


// timeline, graphic asset, sound asset
function Timeline() {	
}

Timeline.preload = function() {
}

Timeline.start = function() {
}

Timeline.restart = function() {
	// title page
	// press to begin
}




/* 
	timeline
	spawn of monsters
*/


/**
 * Perform console logging, it will be commented out for the final build
 * @suppress {missingRequire}  
 */
function log(l) {
	console.debug(l);		
}

function Update() {


	if(World.state == 0 || World.state == 1) {
		Controls.update();

		World.viewportx=Player.x;
		World.viewporty=Player.y;

		// 
		Player.grounded = false;
		Player.vx *= World.friction;
		Player.vy += Player.steady ? 0.1 : World.gravity;

		// clear the canvas screen     	
		context.clearRect(0, 0, canvaswidth, canvasheight);		

		// camera viewport focusing to player
		World.viewportx = Player.x-canvaswidth+64; //Player.x-canvaswidth/2;     	
		World.viewporty = Player.y-canvasheight/2;

		// render the other componentss
		for(let i=0; i<components.length; i++) {
			if(components[i].x < -2000 || components[i].x > 2000) {
				components.splice(i, 1); 
				continue;
			}
			
			context.save();
			context.beginPath();
			//context.fillStyle = components[i].color;
			
			if(components[i].fadeout){
				components[i].fadeout--;
				if(components[i].fadeout<=0) {
					//components.splice(i, 1); 
					//components[i].x = -9999;
					Update.Remove(i);
					continue;
				}
				context.globalAlpha = components[i].fadeout/10;
			}

			if(!isNaN(components[i].siny)){
				if( components[i].siny < 0 ) { 
					components[i].y += components[i].siny;	 
					components[i].sinyt--;
					if(components[i].sinyt<=components[i].siny) components[i].siny = -1*components[i].siny;
				}
				else if( components[i].siny > 0 ) {
					components[i].y += components[i].siny;	
					components[i].sinyt++; 
					if(components[i].sinyt>=components[i].siny) components[i].siny = -1*components[i].siny;
				}
				
			}

			



			if( components[i].sprite ) {
				context.drawImage(
					components[i].sprite.image,
					components[i].x-(components[i].fixed?0:World.viewportx), 
					components[i].y-(components[i].fixed?0:World.viewporty), 
					components[i].width, 
					components[i].height);
			
			}
			else if( components[i].text ) {			
				Assets.setText(
					components[i].text,
					0,
					context,
					components[i].x-World.viewportx,
					components[i].y-World.viewporty,
					4); 	
			}
			else {
				context.rect(components[i].x-World.viewportx, components[i].y-World.viewporty, components[i].width, components[i].height);			
			}
			
			context.fill();
			context.restore();

			if( components[i].solid ) {
				let dir = collision(Player, components[i]);
				if(dir==null) {
					// do nothing immediately end the condition    			
				}
				else if (dir == 3 || dir == 4) {
					Player.vx = 0;
					Player.jumping = false;
				} 
				else if (dir == 2) {
					Player.grounded = true;
					Player.jumping = false;
				} 
				else if (dir == 1) {
					Player.vy *= -2;
				}
			}
			if( components[i].bullet && components[i].xspeed && World.moving) {
				components[i].vx = -components[i].xspeed; // how high to jump	
				components[i].x += components[i].vx;    			
			}    		
			if( components[i].bullet && components[i].yspeed && World.moving) {
				components[i].vy = -components[i].yspeed; // how high to jump	
				components[i].y += components[i].vy;
			}
			if( components[i].repeat && components[i].x<=-components[i].width && components[i].xspeed>0  ) {
				components[i].x=components[i].width;				
			}
			if( components[i].repeat && components[i].x>=components[i].width && components[i].xspeed<0  ) {
				components[i].x=-components[i].width;				
			}
			

			if( components[i].enemy && components[i].x < Player.x ) {
				// damage collision on player
				if(components[i].damage>0 && collision(components[i], Player)!=null){
					Player.hp -= components[i].damage
					components.push(new Component({x:Player.x+getrandom(16,42),y:Player.y,text:(components[i].damage+' '),fadeout:20}));
					if( Player.hp <= 0 ) {
						World.state = 2;
						Player.hp = 0;
					}
					components.push(new Component({x:Player.x,y:Player.y,width:64,height:64,pushback:10,damage:1,sprite:Explosion.sprite,fadeout:10}));
					components[i].damage = 0;
					Update.Remove(i);
				}

				// damage collision on player bullets
				for(let j=0; j<components.length; j++) {
					if(components[j].playerbullet && components[j].damage>0 && collision(components[i], components[j])!=null) {
						components[i].hp -= components[j].damage;
						components[i].x -= components[j].pushback;
						components.push(new Component({x:components[i].x+getrandom(16,42),y:components[i].y,text:(components[j].damage+' '),fadeout:20}));
						if( components[i].hp < 0 ) {
							//components.splice(i, 1);
							//components[i].x = -9999;
							Player.points+=Math.floor(components[i].cost/10)+components[i].damage;
							
							Update.Remove(i);
						}
						components[j].damage = 0;
						//components.splice(j, 1);
						Update.Remove(j);
						//components[j].x = -9999;
						
						// explosion					
						components.push(new Component({x:components[i].x,y:components[i].y,width:64,height:64,pushback:10,damage:1,sprite:Explosion.sprite,fadeout:10}));
						

						break;
					}
				}
			}		
		}
		
		if(Player.grounded){
			Player.vy = 0;
		}

	    Player.x += Player.vx;
	    Player.y += Player.vy;

	    // render. add the player sprite
	    context.save();
	    context.beginPath();	    
		context.drawImage(Player.sprite.image,Player.x-World.viewportx, Player.y-World.viewporty, Player.width, Player.height)	
		context.fill();		
		context.restore();
	}

	

	switch(World.state) {
		case 0: Update.StartState0(); break;
		case 1: Update.PlayState1(); break;
		case 2: Update.GameoverState2(); break;
	}

	Assets.setText(Player.hp+' ',0,context,57,12,4);
	Assets.setText(Player.damage+' ',0,context,172,12,4);
	Assets.setText(Player.points+' ',0,context,287,12,4);
	
	
	window.requestAnimationFrame(Update);
}

Update.StartState0 = function() {
	Assets.setText('backfire',0,context,70,85,8); 
	Assets.setText('tailgun ',0,context,206,132,4); 
	Assets.setText('created by',1,context,242,158,2); 
	Assets.setText('rankaru',1,context,266,172,2); 

	Player.hp = 10;

	if( World.timer%3!=0 ) Assets.setText('press to fight',4,context,80,266,4); 
}


Update.PlayState1 = function() {
	if(World.enemyspawn<=0) {
		let c = (new Component(Enemy)).clone();
		components.push(c);
		World.enemyspawn = c.cost;
		World.majorspawn--;
	}	

	if(World.majorspawn<=0) {		
		World.majorspawn = Math.floor(World.majorbase * 1.6);
		World.majorbase = World.majorspawn;
		World.showwarning = 1;

		components.push(new Component({gid:2,x:-20,y:50,fixed:1,width:512,height:448,sprite:Assets.spritelist[20],bullet:1,repeat:1,xspeed:8}));
		components.push(new Component({gid:2,x:(-20+512),y:50,fixed:1,width:512,height:448,sprite:Assets.spritelist[20],bullet:1,repeat:1,xspeed:8}));

		components.push(new Component({gid:2,x:-20,y:48,fixed:1,width:512,height:448,sprite:Assets.spritelist[19],bullet:1,repeat:1,xspeed:8}));
		components.push(new Component({gid:2,x:(-20+512),y:48,fixed:1,width:512,height:448,sprite:Assets.spritelist[19],bullet:1,repeat:1,xspeed:8}));

		components.push(new Component({gid:2,x:-20,y:130,fixed:1,width:512,height:448,sprite:Assets.spritelist[19],bullet:1,repeat:1,xspeed:-8}));
		components.push(new Component({gid:2,x:(-20-512),y:130,fixed:1,width:512,height:448,sprite:Assets.spritelist[19],bullet:1,repeat:1,xspeed:-8}));


		setTimeout(function(){
			let c = (new Component(Enemy)).clone();	
			components.push(c);
			World.showwarning = 0;
			Update.RemoveByGID(2);
		},7000);				
	}

	if(World.showwarning) {
		if( World.timer%3!=0 ) Assets.setText('warning',2,context,70,85,8); 
		Assets.setText('incoming boss class',0,context,70,136,3); 
	}

	World.enemyspawn--;
}

Update.GameoverState2 = function() {
	
	Player.damage = 1;
	Player.points = 0;

	Assets.setText('gameover',2,context,45,85,8); 

	if( World.timer%3!=0 ) Assets.setText('press to restart',0,context,52,136,4); 

	for(let i=0; i<components.length; i++) if(components[i].enemy) Update.Remove(i);
	
}

Update.RemoveByGID = function(gid){	
	for(let i=0; i<components.length; i++) if(components[i].gid == gid) Update.Remove(i);
}

Update.Remove = function(componentsid){	
	if(components[componentsid]) components[componentsid].x = -9999;
}


function Mouse() { }

Mouse.px = 0; Mouse.py = 0;

Mouse.getCursorPosition = function(el, event) {
	let x, y;
	x = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft - Math.floor(el.offsetLeft);
	y = event.clientY + document.body.scrollTop + document.documentElement.scrollTop - Math.floor(el.offsetTop) + 1;	
	return {x:x,y:y};
}

function Controls(){
	// keyboard
	window.onkeydown = Controls.press;
	window.onkeyup = Controls.release;
	
	

	let d = function(e){
		let pos = Mouse.getCursorPosition(canvas,e), w = parseInt(canvas.style.width,10);	

		if( isNaN(pos.x) ) return;		

		if( pos.x <  w/2 ){						
			Controls.press({keyCode:0});
		}
		else {
			e.keyCode = 32; // jump			
			Controls.press(e);
		}
		
	};

	

	// mouse Touch control
	canvas.onmousedown = function(e){
		d(e);		
	};
	canvas.onmouseup = function(e){
		timeout(Controls.release)
	}

	canvas.ontouchstart = function(e){
		e.clientX = e.touches[0].clientX;
		e.clientY = e.touches[0].clientY;
		d(e);		
	};
	canvas.ontouchend = function(e){
		timeout(Controls.release)
	}
}

Controls.shoot = 0;
Controls.jump = 0;

Controls.press = function(e){
	switch(World.state){
		case 0: 
			timeout(function(){ World.state = 1; });
			break;
		case 1: 
			switch(e.keyCode) {
				case 32: // space
					Controls.jump = 1; 
					Player.steady = 0;				
					break; 
				default:
					Player.vy = 0;					
					Player.steady = 1;
					Controls.shoot = 1;
					break;
			}
			break;
		case 2: 
			timeout(function(){ World.state = 0; });			
			break;
	}	
}

Controls.release = function(){
	// Player.steady = 0;
	Controls.jump = 0; 
	Controls.shoot = 0;
}

Controls.update = function(){
	if(Controls.jump && !Player.jumping){ // && Player.grounded){
		Player.jumping = 1;
		Player.vy = -Player.yspeed * 2; // how high to jump
	}

	if( Controls.shoot > 0 ) {
		//Controls.shoot = 0;		
		// generate the project tile

		// twin 
		if(Player.cooldown==0) {
			let basecooldown = 3, damage = Math.ceil(Player.damage/Player.missletype);
			switch(Player.missletype) {			
				case 2: // twin					
					components.push((new Component(Missle)).clone({damage:damage,x:Player.x-20,y:Player.y+15}));
					components.push((new Component(Missle)).clone({damage:damage,x:Player.x-20,y:Player.y-15}));
					basecooldown += 1;
					break
				case 3: // spray
					components.push((new Component(Missle)).clone({damage:damage,x:Player.x-20,y:Player.y}));
					components.push((new Component(Missle)).clone({damage:damage,x:Player.x-20,y:Player.y-15,yspeed:1,vy:0}));
					components.push((new Component(Missle)).clone({damage:damage,x:Player.x-20,y:Player.y+15,yspeed:-1,vy:0}));
					basecooldown += 3;
					break;
				case 4: // quad
					components.push((new Component(Missle)).clone({damage:damage,x:Player.x-20,y:Player.y-15}));
					components.push((new Component(Missle)).clone({damage:damage,x:Player.x-20,y:Player.y+15}));
					components.push((new Component(Missle)).clone({damage:damage,x:Player.x-20,xspeed:10,y:Player.y-25,yspeed:1,vy:0}));
					components.push((new Component(Missle)).clone({damage:damage,x:Player.x-20,xspeed:10,y:Player.y+25,yspeed:-1,vy:0}));
					basecooldown += 3;
					break;
				case 5: // full speed
					components.push((new Component(Missle)).clone({damage:damage,x:Player.x-20,y:Player.y}));
					basecooldown -= 2;
					break;	
				case 6: // sine spray
					components.push((new Component(Missle)).clone({damage:damage,x:Player.x-20,y:Player.y}));
					components.push((new Component(Missle)).clone({damage:damage,x:Player.x-20,y:Player.y,xspeed:10,siny:8}));
					components.push((new Component(Missle)).clone({damage:damage,x:Player.x-20,y:Player.y,xspeed:10,siny:-8}));
					basecooldown += 4;
					break;
				case 7: // charge
					timeout(function(){
						components.push((new Component(Missle)).clone({damage:damage,x:Player.x-20,y:Player.y,xspeed:8}));
						components.push((new Component(Missle)).clone({damage:damage,x:Player.x-20,y:Player.y,xspeed:10}));
						components.push((new Component(Missle)).clone({damage:damage,x:Player.x-20,y:Player.y-15,xspeed:16}));
						components.push((new Component(Missle)).clone({damage:damage,x:Player.x-20,y:Player.y+15,xspeed:16}));
						components.push((new Component(Missle)).clone({damage:damage,x:Player.x-20,y:Player.y,xspeed:10,siny:5}));
						components.push((new Component(Missle)).clone({damage:damage,x:Player.x-20,y:Player.y,xspeed:10,siny:-5}));
						components.push((new Component(Missle)).clone({damage:damage,x:Player.x-20,y:Player.y,xspeed:15,siny:8}));
						components.push((new Component(Missle)).clone({damage:damage,x:Player.x-20,y:Player.y,xspeed:15,siny:-8}));
						components.push((new Component(Missle)).clone({damage:damage,x:Player.x-20,y:Player.y,xspeed:20,siny:10}));
						components.push((new Component(Missle)).clone({damage:damage,x:Player.x-20,y:Player.y,xspeed:20,siny:-10}));
						components.push((new Component(Missle)).clone({damage:damage,x:Player.x-20,y:Player.y-15,yspeed:2,vy:0}));
						components.push((new Component(Missle)).clone({damage:damage,x:Player.x-20,y:Player.y+15,yspeed:-2,vy:0}));
					});					
					basecooldown += 20;
					break;
				default:
					components.push((new Component(Missle)).clone({damage:damage,x:Player.x-20,y:Player.y}));
					break;
			}
			
			Player.cooldown=basecooldown;
		}
		

		// large

		// 

		/* spray
		components.push({x:Player.x,y:Player.y,xspeed:4,vx:0,width:5,height:5 ,color:'#d0f',bullet:1});
		components.push({x:Player.x,y:Player.y,xspeed:4,vx:0,yspeed:1,vy:0,width:5,height:5 ,color:'#d0f',bullet:1});
		components.push({x:Player.x,y:Player.y,xspeed:4,vx:0,yspeed:-1,vy:0,width:5,height:5 ,color:'#d0f',bullet:1});
		*/
		
	}

	if( Player.jumping && Player.vy>Player.yspeed*Player.jumpingcd/10 ) {
		Player.jumping = 0;
	}
}



function getrandom(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


function collision(shapeA, shapeB) {
	// get the vectors to check against
	let vX = (shapeA.x + (shapeA.width / 2)) - (shapeB.x + (shapeB.width / 2)),
	vY = (shapeA.y + (shapeA.height / 2)) - (shapeB.y + (shapeB.height / 2)),

	// add the half widths and half heights of the objects
	hWidths = (shapeA.width / 2) + (shapeB.width / 2),
	hHeights = (shapeA.height / 2) + (shapeB.height / 2),
	colDir = null;

	// if the x and y vector are less than the half width or half height, they we must be inside the object, causing a collision
	if (Math.abs(vX) < hWidths && Math.abs(vY) < hHeights) {
		// figures out on which side we are colliding (top, bottom, left, or right)
		let oX = hWidths - Math.abs(vX), oY = hHeights - Math.abs(vY);
		if (oX >= oY) {
			if (vY > 0) {
				colDir = 1; //top
				shapeA.y += oY;
			} 
			else {
				colDir = 2; //bottom
				shapeA.y -= oY;
			}
		} 
		else {
			if (vX > 0) {
				colDir = 3; // left
				shapeA.x += oX;
			} 
			else {
				colDir = 4; // right
				shapeA.x -= oX;
			}
		}
	}
	return colDir;
}

/**
 *	@constructor
 */
function Sprite(image, width, height) {
	this.image = image;
	this.width = width;
	this.height = height;
}


function Assets(){	}

Assets.dimension = 32;

Assets.scale = 8;

Assets.palletestring = '';

Assets.pallete = [];

Assets.fontlist = [];

Assets.spritelist = []; // image sprites

Assets.tilemaplist = []; // image tiled map

Assets.canvas = '';

Assets.context = '';

Assets.spritepack = Assetpack;

Assets.init = function() {
	let s = Assets.spritepack.split('~');

	// 1. load the pallet string
	Assets.palletestring = s[0];
	for(let i=0;i<Assets.palletestring.length;i=i+6) {
		Assets.pallete.push('#'+Assets.palletestring.substring(i,i+6));
	}		

	Assets.open(Assets.dimension*Assets.scale, Assets.dimension*Assets.scale);			
	Assets.addFont(s[1],s[2])
	for(let i=3;i<s.length;i++){
		if(s[i].charAt(0)=='|'){			
			Assets.addTilemap(Base92.convert(s[i].charAt(1)),s[i].substring(2));
		}
		else {
			Assets.addSprite(s[i]);	
		}		
	}
	Assets.close();


	//Assets.open(Assets.dimension*Assets.scale, Assets.dimension*Assets.scale);					

	//Assets.close();	
}

Assets.open = function(w,h){
	Assets.canvas = document.createElement('CANVAS'); 
	Assets.context = Assets.canvas.getContext('2d');	
	Assets.canvas.width = w;
	Assets.canvas.height = h;
	document.body.appendChild(Assets.canvas);
}

Assets.close = function(){			
	Assets.canvas.outerHTML = "";				
}

Assets.addTilemap = function(s,st){
	// max tilemap is 32 
	let b = Assets.dimension*Assets.scale, d = s*b;
	Assets.canvas.width = d; 
	Assets.canvas.height = d;
	Assets.context.clearRect(0, 0, d, d);
	Assets.context.beginPath();
	let i = 0, c = 0;
	for(let y=0;y<s;y++){		
		for(let x=0;x<s;x++){
			let a = Base92.convert(st[i]);		 
			if(a<32) {
				let im = Assets.spritelist[a];
				Assets.context.drawImage(im.image, x*im.width, y*im.height, im.width, im.height);	
			}
			else if(a<64){
				c = a-32;	
				Assets.context.fillStyle=Assets.pallete[c];
				Assets.context.fillRect(x*b, y*b, b, b);
			}
			else if(a<72){
				a-=62;									
				Assets.context.fillRect(x*b, y*b, a*b, b);										
			}
			else if(a<80){
				a-=70;												
				Assets.context.fillRect(x*b, y*b, b, a*b);	
			}	
			
			//Assets.context.fillStyle=Assets.pallete[c];
			//Assets.context.fillRect(x*Assets.scale, y*Assets.scale, Assets.scale, Assets.scale);				
			if(i<st.length-1){
				i++;
			}
		}
	}
	let image = new Image();
	image.src = Assets.canvas.toDataURL();
	Assets.tilemaplist.push({image:image,width:d,height:d});	
}

Assets.addSprite = function(st){
	let x=0,y=0,c=0,an=st.split('}'),al=[];

	Assets.context.clearRect(0, 0, Assets.dimension*Assets.scale, Assets.dimension*Assets.scale);
	Assets.context.beginPath();
	
	// do the aimation here
	for(let j=0;j<an.length;j++){
		let s = an[j];
		for(let i=0;i<s.length;i++){
			let a = Base92.convert(s[i])				
			if(a<32){
				x = a;
				y = Base92.convert(s[i+1]);												
				Assets.context.fillRect(x*Assets.scale, y*Assets.scale, Assets.scale, Assets.scale);				
				i+=1;
			}
			else if(a<64){
				c = a-32;	
				Assets.context.fillStyle=Assets.pallete[c];
			}
			else if(a<72){
				a-=62;									
				Assets.context.fillRect(x*Assets.scale, y*Assets.scale, a*Assets.scale, Assets.scale);
			}
			else if(a<80){
				a-=70;												
				Assets.context.fillRect(x*Assets.scale, y*Assets.scale, Assets.scale, a*Assets.scale);	
			}					
		}
		
		let image = new Image();
		image.src = Assets.canvas.toDataURL();
		let imageAsset = new Sprite(image,Assets.dimension*Assets.scale,Assets.dimension*Assets.scale);

		Assets.spritelist.push(imageAsset);
	}
	
	
	
}

Assets.addFont = function(c,s){ // colorset, font
	for(let k=0;k<c.length;k++){
		Assets.addSprite(c.charAt(k)+s);
		Assets.loadFont(k);
	}			
}

Assets.loadFont = function(index){
	let x=0,y=0,c=0,d=5*Assets.scale,f=[];
	Assets.canvas.width = d; 
	Assets.canvas.height = d;
	for(let i=0;i<6;i++){
		for(let j=0;j<6;j++){
			let image = new Image();
			Assets.context.clearRect(0, 0, d, d);		
			Assets.context.drawImage(Assets.spritelist[index].image,j*d,i*d,d,d,0,0,d,d);
			image.src = Assets.canvas.toDataURL();
			f.push({image:image});
			// document.body.appendChild(image);
		}				
	}
	Assets.fontlist.push(f); //console.debug('Assets.fontlist',f);
	Assets.canvas.width = Assets.dimension*Assets.scale; 
	Assets.canvas.height = Assets.dimension*Assets.scale;
}

Assets.setText = function(s,i,c,x,y,l){ // s:text, i:indexcolor, c:canvas, x,y:coordinate, l:scale
	let d=5,g=0,t="abcdefghiklmnoprstuvwxyz1234567890+- ",ar=["i1"," ","cef","","mtvwxy"];
	c.imageSmoothingEnabled = false;			
	c.save();
	c.scale(l,l);	
	x=x/l; y=y/l;		
	for(let j=0;j<s.length;j++){				
		let p = t.indexOf(s.charAt(j));			
		if(p!=36) c.drawImage(Assets.fontlist[i][p].image,0,0,d*Assets.scale,d*Assets.scale,x,y,d,d);
		for(let arc=0;arc<ar.length;arc++){
			g=d;
			if(ar[arc].indexOf(s.charAt(j))!=-1){ 
				g=arc+(2);
				break;
			}
		}
		x=x+g;						
	}		
	c.restore();
}

		
function Base92() { }	

/**
	populate the base string, return the character or equivalent count
 */
Base92.convert = function(b) {
	if( !Base92._b ) {
		Base92._b = ''; for(let i=33;i<127;i++) Base92._b += (i!=34&&i!=92) ? String.fromCharCode(i) : '';
	}
	return typeof b == 'string' ? Base92._b.indexOf(b) : Base92._b.charAt(b);	
}