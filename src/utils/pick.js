const validate = require('validate.js');
const sift = require('sift').default;
const {deletePropertyPath} = require('./helpers');

const can = function(data, conditions) {
  const _sift = sift(conditions);
  return _sift(data);
};

const getFieldProperties = function(field){
  if(typeof field === 'string'){
    const isNegative = field[0] === '-';
    const fieldName = isNegative ? field.substr(1) : field; // remove '-' from fieldName
    return {
      name: fieldName,
      isNegative: isNegative,
      isDeep: fieldName.includes('.')
    };
  }else{
    let fieldName = Object.keys(field)[0];
    const isNegative = fieldName[0] === '-';
    fieldName = isNegative ? fieldName.substr(1) : fieldName; // remove '-' from fieldName
    return {
      name: fieldName,
      conditions: field[Object.keys(field)[0]],
      isNegative: isNegative,
      isDeep: fieldName.includes('.')
    };
  }
};
/**
 * @function pick
 * @param {object} data Pass nested object {}
 * @param {array} fields ['_id',{'user': {userId: 'aav'}}]
 * console.log(pick(testObject, ['id', 'user.name', 'comments.body'])); // Get only specific field
 *  console.log(pick(testObject, ['-user.name'])); // Get all values except user.name
 */
const pick = function(data, _fields){
  let values = {};
  let isFieldsNegative = false;
  
  
  /**
   * convert _fields to [{name: String, isNegative: Boolean, isDeep: Boolean}, {name: String, isNegative: Boolean, conditions: Object, isDeep: Boolean}]
   */
  const fields = _fields.map(field => {
    const fieldProperties = getFieldProperties(field);// check if one of the fields start with '-','-name' OR {'-name': {id: 123}}
    if(fieldProperties.isNegative) isFieldsNegative = true;
    return fieldProperties;
  });

  if(isFieldsNegative){ // When one of the fields start with '-'
    values = data;
    fields.forEach(({isNegative, name, conditions}) => {
      if(isNegative){
        if(!conditions || can(data, conditions)){
          deletePropertyPath(values, name);
        }
      }else{
        throw new Error('pick() did not except nested fields negative "-" and positive');
      }
    });
    return values;
  }
  

  fields.forEach(({name, conditions, isDeep}) => {
    
    if(conditions && !can(data, conditions)){ // if can return false the skip this field
      return;
    }
    const fieldKey = name;
    if(isDeep){ // 'product.price'
      const splitFieldKey = fieldKey.split('.');
      const [objectKey, insideFieldsKey] = splitFieldKey;
      const value = data[objectKey];
      const valueType = typeof value;
      if(value && valueType === 'object'){ // key: 'product.price' and value is {price, name} or [{price,name}]
        if(Array.isArray(value)){ // key: 'product.price' and value is [{price,name}]
          var fieldDeep =  fieldKey.split('.');
          fieldDeep.shift();
          fieldDeep = fieldDeep.join('.');
          value.forEach((item, index) => { // return all [{price}]
            if(!values[objectKey]) values[objectKey] = [];
            const fieldValue = validate.getDeepObjectValue(item, fieldDeep);
            if(!values[objectKey][index]) values[objectKey][index] = {};
            if(fieldValue !== undefined){
              Object.assign(values[objectKey][index], {[insideFieldsKey]: fieldValue});
            }
          });
        }else{
          const fieldValue = validate.getDeepObjectValue(data, fieldKey); // return {price}
          const objectToSign = {[insideFieldsKey]: fieldValue};
          if(splitFieldKey.length === 3){
            if(fieldValue !== undefined){
              const secondeObjKey = splitFieldKey[1];
              if(!values[objectKey]) values[objectKey] = {secondeObjKey: {}};
              if(!values[objectKey][secondeObjKey]) values[objectKey][secondeObjKey] = {};
              values[objectKey][secondeObjKey][splitFieldKey[2]] =  fieldValue;
            }
          }else{
            values[objectKey] = Object.assign(values[objectKey] || {}, objectToSign);
          }
        }
      }else{ // key: 'product.price' and value is 'someString'
        const [objectKey] = fieldKey.split('.');
        values[objectKey] = data[objectKey]; // return the string
      }
    }else{
      if(data[fieldKey] !== undefined){
        values[fieldKey] = data[fieldKey]; // key is 'product', return data.product as is
      }
    }
  });

  return values;
};

module.exports = pick;


// const testObject = {
//   '_id': 4,
//   'userId':'aak',
//   'user': {
//     'id': 'aak',
//     'name': 'Leanne Graham',
//     'username': 'Bret',
//     'email': 'Sincere@april.biz',
//     'address': {
//       'street': 'Kulas Light',
//       'suite': 'Apt. 556',
//       'city': 'Gwenborough',
//       'zipcode': '92998-3874',
//       'geo': {
//         'lat': '-37.3159',
//         'lng': '81.1496'
//       }
//     },
//     'phone': '1-770-736-8031 x56442',
//     'website': 'hildegard.org',
//     'company': {
//       'name': 'Romaguera-Crona',
//       'catchPhrase': 'Multi-layered client-server neural-net',
//       'bs': 'harness real-time e-markets'
//     }
//   },
//   'title': 'eum et est occaecati',
//   'body': 'ullam et saepe reiciendis voluptatem adipisci\nsit amet autem assumenda provident rerum culpa\nquis hic commodi nesciunt rem tenetur doloremque ipsam iure\nquis sunt voluptatem rerum illo velit',
//   'comments': [
//     {
//       'postId': 1,
//       'id': 1,
//       'name': 'id labore ex et quam laborum',
//       'email': 'Eliseo@gardner.biz',
//       'body': 'laudantium enim quasi est quidem magnam voluptate ipsam eos\ntempora quo necessitatibus\ndolor quam autem quasi\nreiciendis et nam sapiente accusantium'
//     },
//     {
//       'postId': 1,
//       'id': 2,
//       'name': 'quo vero reiciendis velit similique earum',
//       'email': 'Jayne_Kuhic@sydney.com',
//       'body': 'est natus enim nihil est dolore omnis voluptatem numquam\net omnis occaecati quod ullam at\nvoluptatem error expedita pariatur\nnihil sint nostrum voluptatem reiciendis et'
//     },
//     {
//       'postId': 1,
//       'id': 3,
//       'name': 'odio adipisci rerum aut animi',
//       'email': 'Nikita@garfield.biz',
//       'body': 'quia molestiae reprehenderit quasi aspernatur\naut expedita occaecati aliquam eveniet laudantium\nomnis quibusdam delectus saepe quia accusamus maiores nam est\ncum et ducimus et vero voluptates excepturi deleniti ratione'
//     },
//     {
//       'postId': 1,
//       'id': 4,
//       'name': 'alias odio sit',
//       'email': 'Lew@alysha.tv',
//       'body': 'non et atque\noccaecati deserunt quas accusantium unde odit nobis qui voluptatem\nquia voluptas consequuntur itaque dolor\net qui rerum deleniti ut occaecati'
//     },
//     {
//       'postId': 1,
//       'id': 5,
//       'name': 'vero eaque aliquid doloribus et culpa',
//       'email': 'Hayden@althea.biz',
//       'body': 'harum non quasi et ratione\ntempore iure ex voluptates in ratione\nharum architecto fugit inventore cupiditate\nvoluptates magni quo et'
//     }
//   ]
// };
// console.log(pick(testObject, ['id', 'user.name', 'comments.body']));
// console.log(pick(testObject, ['-user.name']));
// console.log(pick(testObject, ['_id',{'user': {'user.id': 'aak'}}]));
// console.log(pick(testObject, ['_id',{'user': {'user.id': 'WRONGaak'}}]));
// console.log(pick(testObject, ['_id',{'user': {'_id': '4'}}]));
// console.log(pick(testObject, ['_id',{'user.name': {'_id': 4}}]));
// console.log(pick(testObject, ['-_id',{'-user': {userId: 'aak'}}]));