export type City={id:string;name:string;district:string;coordinates:[number,number];description:string;highlights:string[]};
export const cities:City[]=[
{id:'turbat',name:'Turbat',district:'Kech',coordinates:[63.0544,26.0023],description:'A major city in the Makran region, Turbat is known for date cultivation, regional commerce and the University of Turbat.',highlights:['Makran heritage','Date-growing region','University of Turbat']},
{id:'gwadar',name:'Gwadar',district:'Gwadar',coordinates:[62.3254,25.1264],description:'A coastal port city on the Arabian Sea, Gwadar is known for its striking coastline, port and maritime setting.',highlights:['Arabian Sea','Gwadar Port','Hammerhead peninsula']},
{id:'quetta',name:'Quetta',district:'Quetta',coordinates:[66.9750,30.1798],description:'Balochistan’s provincial capital sits in a mountain-ringed valley and serves as a major administrative and commercial center.',highlights:['Provincial capital','Mountain valley','Regional commerce']}
];
export const findCity=(id:string)=>cities.find(city=>city.id===id);
