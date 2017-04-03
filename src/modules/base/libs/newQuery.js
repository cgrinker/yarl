'use babel'
import {compose} from 'redux';
import Documentable from '../../../configure/libs/documentable'
import Commandable from '../../../configure/libs/commandable'
import Tagable from '../../../configure/libs/tagable'

let fs, path;
if(!YARL_BROWSER) {
  fs = require('fs');
  path = require('path');
}

function splitArgTypes(argTypes) {
  return argTypes.map((e)=> {
    const things = e.split(":");
    return {
      name: things[0],
      type: things[1]
    }
  })
}

function newQuery(moduleName, queryName, returnType, argTypes) {

  if(!fs.existsSync(path.join(process.cwd(), `src/modules/${moduleName}`)))
  {
    console.error(`No Such Module ${moduleName}`);
    return;
  }

  const queryFile = fs.readFileSync(path.join(process.cwd(),
    `src/modules/${moduleName}/model/queries.js`)).toString();

  const t1 = queryFile.indexOf('`') + 1;
  const t2 = queryFile.lastIndexOf('`');

  let queries = queryFile.slice(t1, t2).split("\n");
  for (let q = 0; q < queries.length; q++) {
    if(queries[q].includes(queryName)) {
      console.error(`Query ${queryName} already exists in module ${moduleName}`);
      return;
    }
  }

  let ret = Context.GraphQL._typeMap[returnType.replace(/[\[\]!]/g, "")];
  if(ret === undefined) {
    console.error(`Return Type: '${returnType}' does not exist in Schema`);
    return;
  }
  if(ret.constructor.name === 'GraphQLInputObjectType') {
    console.error(`Return Type: '${returnType}' Must be either Scaler or ObjectType, not InputType`);
    return;
  }
  let args = splitArgTypes(argTypes);

  for(let i = 0; i < args.length; i++ ) {
    let typ = Context.GraphQL._typeMap[args[i].type.replace(/[\[\]!]/g, "")];
    if(typ === undefined) {
      console.error(`Argument ${args[i].name}'s type ${args[i].type} does not exist in Schema'`);
      return;
    }
    if(typ.constructor.name === 'GraphQLObjectType') {
      console.error(`Argument ${args[i].name}'s type ${args[i].type} Must be either Scalar or InputType, not ObjectType`);
      return;
    }
  }
  queries.push(`${queryName}${args.length ? `(${argTypes})` : ''}: ${returnType}`);

  fs.writeFileSync(
    path.join(process.cwd(),`src/modules/${moduleName}/model/queries.js`),
`export default \`
${queries.join("\n")}
\`;
`.replace("\n\n", "\n"));
}

export default compose (
  Documentable({
  text: `# newQuery
Generate a New GraphQL Query
`,
  args: {
    moduleName: 'Name of Module',
    queryName: 'Name of Query',
    returnType: 'Type of Return. Required',
    argTypes: 'Option Arguments to pass to query, in argName:Type pairs'
  }
}),
  Commandable((program) => {
  program
    .command('newQuery <moduleName> <queryName> <returnType> [argTypes...]' )
    .description('Create a New GraphQL Query')
    .action(newQuery);
}),
  Tagable({platform: 'any'})
)(newQuery);