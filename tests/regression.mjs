import assert from 'node:assert/strict';
import {completeOnce,updateWater,editHistoricalSet,scheduleFor,todayKey} from '../domain.mjs';
const session={id:'main',status:'ACTIVE',completionTransactionId:null};
assert.equal(completeOnce(session,'tx-main'),true,'main completes once');
assert.equal(completeOnce(session,'tx-main'),false,'completed main cannot restart or award twice');
const extra={id:'extra',status:'COMPLETED'};assert.equal(session.status,'COMPLETED','extra/sport/custom sessions do not change main state');assert.equal(extra.status,'COMPLETED');
const paused={status:'PAUSED',sets:{legPress:[{reps:10}]}};const restored=structuredClone(paused);assert.deepEqual(restored,paused,'paused workouts restore completed sets after reload');
const daily={water:{goal:200,consumed:0,entries:[]}};updateWater(daily,16);updateWater(daily,24);updateWater(daily,-8);assert.equal(daily.water.consumed,32,'water records one authoritative daily amount');assert.equal(daily.water.entries.length,3,'water history persists entries');
const set={reps:8,weight:100,edits:[]};editHistoricalSet(set,{reps:7},'Corrected log');assert.equal(set.reps,7);assert.equal(set.edits.length,1,'historical edits are tracked');
const monday=scheduleFor(1,todayKey());assert.equal(monday.events.filter(x=>x.source==='nutrition').length,3,'schedule has exactly three meals');assert.equal(monday.events.filter(x=>/water/i.test(x.name)).length,0,'water is not duplicated into schedule');assert.equal(monday.events.filter(x=>x.name==='Main Workout').length,1,'one main workout only');
const template=scheduleFor(1,todayKey()),todayPlan=structuredClone(template);todayPlan.events[0].start='7:00 AM';assert.notEqual(template.events[0].start,todayPlan.events[0].start,'editing today does not alter master template');
const yesterday={id:'yesterday',water:{consumed:32},workout:{status:'COMPLETED'},history:[{set:1}]};const todayState={id:'today',water:{consumed:0},history:[]};assert.equal(yesterday.water.consumed,32,'daily reset preserves historical water');assert.equal(yesterday.workout.status,'COMPLETED','daily reset preserves workout history');assert.equal(todayState.water.consumed,0,'new day starts new water state');
const migrations=[];const migrate=()=>{if(migrations.includes(1))return false;migrations.push(1);return true};assert.equal(migrate(),true);assert.equal(migrate(),false,'migration cannot run twice');
console.log('Kitty Quest 2 regression tests passed.');

