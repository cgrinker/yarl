'use babel'
import {compose} from 'redux';
import Documentable from '../../../configure/libs/documentable'
import Commandable from '../../../configure/libs/commandable'
import Tagable from '../../../configure/libs/tagable'

import casualByPropTypeString from './casualByPropTypeString';

let fs, path;
if(!YARL_BROWSER) {
  fs = require('fs');
  path = require('path');
}

function useDocumentable(name, args=[]) {
  const sArgs = args.map((e, i) => {
    const val = e.split(":");
    return `${val[0]}: '{${val[1]}} ${val[0]}'`;
  }).join(',\n    ');
  return `@Documentable({
  text: \`# ${name}\`,
  args: {
    ${sArgs}
  }
})`;
}

function useConnectable(moduleName, componentName) {
  return `@connect((state)=>{
    ${componentName}: state.app.${moduleName}.${componentName}
})`
}

function useTagable(propTypes) {
  return `@Tagable({platform: 'any'})`;
}

function useRoutable(componentName, propTypes) {
  return `@Routable('${componentName}', {
  displayName: '',
  description: ''
})`;
}

function expandPropTypes(pairList) {
  return pairList.map((e, i) => {
    const s = e.split(":");
    return `${s[0]}: PropTypes.${s[1]}`;
  }).join(",\n    ");
}

function expandDefaultProps(pairList) {
  return pairList.map((e, i) => {
    const s = e.split(":");
    return `${s[0]}: ${casualByPropTypeString(s[1])}`;
  }).join(",\n    ");
}
function newComponent(moduleName, componentName, propTypes, options) {
  if(!fs.existsSync(path.join(process.cwd(), `src/modules/${moduleName}`)))
  {
    console.error(`No Such Module ${moduleName}`);
    return;
  }
  if(fs.existsSync(path.join(process.cwd(), `src/modules/${moduleName}/components/${componentName}.js`)))
  {
    console.error(`Component ${componentName} Already Exists In ${moduleName}`);
    return;
  }

  const outfile = path.join(process.cwd(), `src/modules/${moduleName}/components/${componentName}.js`);
  const yarlPath = (options.yarl) ? '../../..': '@offbyonestudios/yarl';
  fs.writeFileSync(outfile, `'use babel'
import React, {Component, PropTypes} from 'react';

${(options.connectable) ? `import {connect} from 'react-redux';`: ''}
import casual from 'casual-browserify';

${(options.documentable) ? `import Documentable from '${yarlPath}/configure/libs/documentable';`: ''}
${(options.routable) ? `import Routable from '${yarlPath}/configure/libs/routable';`: ''}
${(options.tagable) ? `import Tagable from '${yarlPath}/configure/libs/tagable';`: ''}
${(options.typable) ? `import Typable from '${yarlPath}/configure/libs/typable';`: ''}


${(options.documentable) ? `${useDocumentable(componentName, propTypes)}` : ''}
${(options.tagable) ? `${useTagable(componentName)}` : ''}
${(options.typable) ? `@Typable("${componentName}")` : ''}
${(options.routable) ? `${useRoutable(componentName)}` : ''}
${(options.connectable) ? `${useConnectable(moduleName, componentName)}` : ''}
class ${componentName} extends Component {
  static propTypes = {
    ${expandPropTypes(propTypes)}
  }
  static defaultProps = {
    ${expandDefaultProps(propTypes)}
  }

  render() {
    const body = baseRenderByPropType('${moduleName}', '${componentName}', this.props, this.propTypes);
    return (
      <div>
        <h3>${componentName}</h1>
        {body}
      </div>
    );
  }
}
`);
  regenerateIndex(path.join(process.cwd(), `src/modules/${moduleName}/components/`));
}

export default compose (
  Documentable({
    text: `# newComponent`,
    args: {
      moduleName: 'string name of module',
      componentName: 'string name of component',
      propTypes: 'list of <name>:<type> pairs',
      options: 'object of boolean options'
    }
  }),
  Commandable((program) => {
    program
      .command('newComponent <moduleName> <componentName> [propTypes...]' )
      .description('Generate A New Component')
      .option('-d, --documentable', 'Add Documentable Decorator')
      .option('-c, --connectable', 'Add Redux Connect Decorator')
      .option('-r, --routable', 'Add Routable Decorator')
      .option('-g, --typable', 'Add Typable Decorator')
      .option('-t, --tagable', 'Add Tagable Decorator')
      .option('-y, --yarl', 'Generate inside the yarl Package')
      .action(newComponent);
  }),
  Tagable({platform: 'any'})
)(newComponent);
