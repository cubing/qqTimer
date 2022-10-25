/*
	Random state sliding puzzle solver, written by Ben Whitmore (originally in C++).
*/

function SlidySolver(width, height, regions) {
	this.width = width;
	this.height = height;
	this.n = width*height;
	this.regions = regions;
	
	this.fixedTiles = [];
	this.movableTiles = [];
	this.states = [];
	this.regsize = 0;
	this.fixedsize = 0;
	this.tiles = [];
	this.gap = 0;
	this.gapDelta = [width, 1, -width, -1];
	
	this.init();
	this.maketables();
}

SlidySolver.prototype.regionSize = function(r){
    var x=this.n-this.fixedTiles[r].length;
    var y=x;
    for(var i=1;i<this.regions[r].length;i++) {
		y--;
		x*=y;
	}
    return x;
}

SlidySolver.prototype.contains = function(arr, val){
    for(var i=0;i<arr.length;i++)
		if(arr[i]==val)
			return true;
    return false;
}

SlidySolver.prototype.resetTilesToRegion = function(region){
    for(var i=0;i<this.n;i++) {
        if(this.contains(this.regions[region],i+1) || this.contains(this.fixedTiles[region],i+1))
			this.tiles[i]=i+1;
        else
			this.tiles[i]=0;
    }
    this.tiles[this.n-1]=this.n;
    this.gap=this.n-1;
}

SlidySolver.prototype.indexof = function(arr, val){
    for(var i=0;i<arr.length;i++)
		if(arr[i]==val)
			return i;
    return -1;
}

SlidySolver.prototype.encode = function(r){
	var positions = [];
	var positions2 = [];
    for(var i=0; i<regsize; i++){
        positions[i] = this.indexof(this.movableTiles[r],this.indexof(this.tiles,this.regions[r][i])+1);
    }
    for(var i=0; i<regsize; i++){
        positions2[i]=positions[i];
        for(var j=0; j<i; j++)
            if(positions[j]<positions[i])
				positions2[i]--;
    }
    var index=positions2[0];
    for(var i=1; i<regsize; i++){
        index*=(this.n-fixedsize-i);
        index+=positions2[i];
    }
    return index;
}

SlidySolver.prototype.decode = function(t, r){
    var n2 = this.n-fixedsize;
    var positions = [];
    for(var i=0; i<regsize; i++){
        positions[regsize-1-i]=t%(i+n2-regsize+1);
        t = Math.floor(t/(i+n2-regsize+1));
    }
    for(var i=regsize-1; i>=0; i--){
        for(var j=regsize-1; j>i; j--){
            if(positions[j]>=positions[i])
				positions[j]++;
        }
    }
    for(var i=0; i<regsize; i++){
        positions[i] = this.movableTiles[r][positions[i]]-1;
    }
    for(var i=0; i<this.n; i++){
        if(this.contains(this.fixedTiles[r],i+1))
			this.tiles[i]=i+1;
        else
			this.tiles[i]=0;
    }
    for(var i=0; i<regsize; i++){
        this.tiles[positions[i]] = this.regions[r][i];
        if(this.tiles[positions[i]] == this.n)
			this.gap=positions[i];
    }
}

SlidySolver.prototype.moveBlankTo = function(pos){
    this.tiles[this.gap]=this.tiles[pos];
    this.tiles[pos]=this.n;
    this.gap=pos;
}

SlidySolver.prototype.canDoMove = function(g, m){
    if(m==0)
		return g<(this.width*(this.height-1));
    else if(m==1)
		return (g%this.width)!=(this.width-1);
    else if(m==2)
		return g>=this.width;
    else if(m==3)
		return (g%this.width)!=0;
    return false;
}

SlidySolver.prototype.canMoveInRegion = function(t, g, m, r){
	return !this.contains(this.fixedTiles[r],t[g+this.gapDelta[m]]);
}

SlidySolver.prototype.move = function(t, g, m){
    if(!this.canDoMove(g,m))
		return false;
    t[g] = t[g+this.gapDelta[m]];
	t[g+this.gapDelta[m]] = this.n;
    return true;
}

SlidySolver.prototype.regionmove = function(t, g, m,r){
    if(!this.canMoveInRegion(t,g,m,r)) return false;
    return this.move(t,g,m);
}

SlidySolver.prototype.maketables = function(){
    var depth, encoded, x;
    states = [];
    for(var reg=0; reg<this.regions.length; reg++){
        x = this.regionSize(reg);
        states[reg] = [];
        for(var pos=0; pos<x; pos++){
            states[reg][pos] = -1;
        }
        depth = 0;
        regsize = this.regions[reg].length;
        fixedsize = this.fixedTiles[reg].length;
        this.resetTilesToRegion(reg);
        var newStates;
		var filledIn = 0;
        for(var tile=0; tile<this.n; tile++){
            states[reg][this.encode(reg)]=0;
            if(this.tiles[tile] == 0 && !this.contains(this.fixedTiles[reg],tile+1)){
                this.moveBlankTo(tile);
                states[reg][this.encode(reg)] = 0;
				filledIn++;
            }
        }
        do{
            newStates = 0;
            for(var pos=0; pos<x; pos++){
                if(states[reg][pos] != depth) continue;
                this.decode(pos, reg);
                for(var mov=0; mov<4; mov++){
                    if(!this.regionmove(this.tiles,this.gap,mov,reg)) continue;
					this.gap += this.gapDelta[mov];
                    encoded = this.encode(reg);
                    if(states[reg][encoded] == -1){
                        states[reg][encoded] = depth+1;
                        newStates++;
						filledIn++;
                    }
                    this.move(this.tiles,this.gap,(mov+2)%4);
					this.gap += this.gapDelta[(mov+2)%4];
                }
            }
            depth++;
        } while(newStates != 0);
    }
}

SlidySolver.prototype.rand = function(x) {
	return Math.floor(Math.random() * x);
}

SlidySolver.prototype.scramble = function(){
    for(var i=0;i<this.n;i++)
		this.tiles[i]=i+1;
    this.gap=this.n-1;
    var a,d,parity=0;
    for(var i=0; i<this.n-1; i++){
        d=i+this.rand(this.n-1-i);
        a=this.tiles[i];
        if(this.tiles[d]==a)
			parity++;
        this.tiles[i]=this.tiles[d];
        this.tiles[d]=a;
    }
    if(parity%2==this.n%2){
        do{
            a=this.rand(this.n-1);
            d=this.rand(this.n-1);
        } while(a==d);
        var temp=this.tiles[a];
        this.tiles[a]=this.tiles[d];
        this.tiles[d]=temp;
    }
    a=this.rand(this.width);
    d=this.rand(this.height);
    for(var i=0;i<a;i++) {
		this.move(this.tiles,this.gap,3);
		this.gap += this.gapDelta[3];
	}
    for(var i=0;i<d;i++) {
		this.move(this.tiles,this.gap,2);
		this.gap += this.gapDelta[2];
	}
}

SlidySolver.prototype.getscramble = function(){
	this.scramble();
    var scr = "";
    var currentDepth;
    var scrambledPuzzle = [];
    for(var i=0;i<this.n;i++)
		scrambledPuzzle.push(this.tiles[i]);
    var scrambledPuzzleGap, g;
    var moves=['D','R','U','L'];
    for(var i=0; i<this.regions.length; i++){
        regsize = this.regions[i].length;
        fixedsize = this.fixedTiles[i].length;
        for(var j=0; j<this.n; j++){
            if(this.contains(this.regions[i],scrambledPuzzle[j]) || this.contains(this.fixedTiles[i],scrambledPuzzle[j]))
				this.tiles[j] = scrambledPuzzle[j];
            else
				this.tiles[j] = 0;

            if(scrambledPuzzle[j] == this.n){
                scrambledPuzzleGap=j;
                g=j;
            }
        }
        currentDepth = states[i][this.encode(i)];
        while(currentDepth != 0){
            for(var j=0; j<4; j++){
                if(!this.regionmove(this.tiles, g, j, i)) continue;
				g += this.gapDelta[j];
                this.move(scrambledPuzzle, scrambledPuzzleGap, j);
				scrambledPuzzleGap += this.gapDelta[j];
                if(states[i][this.encode(i)] == currentDepth-1){
                    scr = moves[j]+scr;
                    break;
                } else{
                    this.move(this.tiles, g, (j+2)%4);
					g += this.gapDelta[(j+2)%4];
                    this.move(scrambledPuzzle, scrambledPuzzleGap, (j+2)%4);
					scrambledPuzzleGap += this.gapDelta[(j+2)%4];
                }
            }
            currentDepth--;
        }
    }
    return this.prettyScramble(scr);
}

SlidySolver.prototype.prettyScramble = function(str){
 var move = " ", cnt = 0, output = "";
 for (var i=0; i<str.length; i++) {
  if (str[i] == move) {
   cnt++;
  } else {
   if (cnt == 1) {
    output += move + " ";
   } else if (cnt > 1) {
    output += move + cnt + " ";
   }
   move = str[i];
   cnt = 1;
  }
 }  if (cnt == 1) {	 	 output += move;	  } else if (cnt > 1) {	 	 output += move + cnt;	  }
 return output;
}

SlidySolver.prototype.init = function(){
	for(var i=0;i<this.regions.length;i++){
		this.fixedTiles.push([]);
		for(var j=0;j<i;j++)
			for(var k=0;k<this.regions[j].length;k++)
				this.fixedTiles[i].push(this.regions[j][k]);
	}
    for(var i=0;i<this.regions.length;i++){
        this.movableTiles.push([]);
        for(var j=1;j<=this.n;j++){
            if(!this.contains(this.fixedTiles[i],j))
				this.movableTiles[i].push(j);
        }
    }
	for(var i=0;i<this.regions.length;i++)
		this.regions[i].push(this.n);
    for(var i=0;i<this.n;i++)
		this.tiles.push(0);
}

SlidySolver.prototype.statecount = function() {
	var cnt = 0;
	for (var i=0; i<this.regions.length; i++) {
		cnt += this.regionSize(i);
	}
	return cnt;
}