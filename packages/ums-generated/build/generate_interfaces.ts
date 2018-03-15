/**
 * Automagically generate typings, interfaces, etc. for event data sent to and received from UMS.
 */

/* tslint:disable: no-var-requires */

import { remove, writeJson } from "fs-extra";
import * as Parser from "json-schema-ref-parser";
import { compile } from "json-schema-to-typescript";
import { query } from "jsonpath";
import { join, basename, extname } from "path";
import Ast, {
  SourceFile,
  Scope,
  VariableDeclarationType,
  EnumDeclarationStructure,
  EnumMemberStructure,
  PropertySignatureStructure,
  InterfaceDeclarationStructure,
  TypeAliasDeclarationStructure,
  FunctionDeclarationStructure,
  ClassDeclarationStructure,
  MethodDeclarationStructure,
  VariableStatementStructure,
  ExportDeclarationStructure,
  ImportDeclarationStructure,
  ImportSpecifierStructure,
} from "ts-simple-ast";

// we cannot use this modules via 'import' due to this (lets hope the modules get updated):
// https://github.com/Microsoft/TypeScript/issues/5073
const pascalCase = require("pascal-case");
const jsonSchemaMerge = require("json-schema-merge-allof");

type CodeGeneratorFn = (sourceFile: SourceFile, baseName: string, schema: any) => void;
interface ISchemaType {
  url: string;
  fn?: CodeGeneratorFn;
}
interface IParsedSchemaType extends ISchemaType {
  schema: any;
}

const header = "/* tslint:disable */\n\n";
const autogeneratedBanner = "/** THIS FILE IS AUTOGENERATED FROM THE UMS JSON SCHEMA FILES. DO NOT EDIT MANUALLY. */";
const tsFileFormat = {
  ensureNewLineAtEndOfFile: true,
  indentSize: 2,
  convertTabsToSpaces: true,
};

const notificationTypeName = "INotificationType";
const notificationTypesName = "INotificationsType";
const notificationHandlerName = "INotificationHandler";
const onNotificationFnName = "onNotification";
const sendMessageHandlerName = "ISendHandler";
const sendMessageFnName = "sendMessage";
const iResponseTypeName = "IResponseType";
const iSendTypeName = "ISendType";

const generateSchema = async (schemaType: ISchemaType): Promise<IParsedSchemaType> => {
  const parser = new Parser();
  // https://github.com/BigstickCarpet/json-schema-ref-parser/blob/master/docs/ref-parser.md#bundleschema-options-callback
  // https://github.com/BigstickCarpet/json-schema-ref-parser/blob/master/docs/ref-parser.md#dereferenceschema-options-callback
  return Object.assign({ schema: await parser.dereference(schemaType.url) }, schemaType);
};

const queryEvents = (schema: any): string[] => query(schema, "$.anyOf[*].title");
const queryEventName = (schema: any, event: string): string => query(schema, `$.anyOf[?(@.title == '${event}')].allOf[*].properties.type.default`)[0];

const commonData = (sourceFile: SourceFile, baseName: string, schema: any, interfaceName: string): string[] => {
  const events: string[] = queryEvents(schema);
  const capitalizedBaseName = pascalCase(baseName);

  sourceFile.getInterfaceOrThrow(interfaceName); // ensure the interface exists
  events.map((event) => pascalCase(event))
    .forEach((event) => {
      const eventInterface = sourceFile.getInterfaceOrThrow(event);
      if (eventInterface.getExtends().length === 0) eventInterface.addExtends(interfaceName);
    });

  const eventTypeConfig: TypeAliasDeclarationStructure = {
    name: capitalizedBaseName,
    type: events.map(pascalCase).join(" | "),
    isExported: true,
  };
  sourceFile.addTypeAlias(eventTypeConfig);

  const mappings = events
    .map((event) => {
      const name = queryEventName(schema, event);
      return { event, name };
    });

  const enumConfig: EnumDeclarationStructure = {
    name: `${capitalizedBaseName}Event`,
    isExported: true,
    isConst: true,
  };
  enumConfig.members = mappings.map(({ event, name }): EnumMemberStructure => {
    return {
      // don't be confused with the naming (e.g. enum name != mapping name)
      name: event,
      value: name,
    };
  });
  sourceFile.addEnum(enumConfig);

  const interfaceConfig: InterfaceDeclarationStructure = {
    name: `I${capitalizedBaseName}Type`,
    isExported: true,
  };
  interfaceConfig.properties = mappings.map(({ event, name }): PropertySignatureStructure => ({ name: `"${name}"`, type: pascalCase(event) }));
  sourceFile.addInterface(interfaceConfig);

  const typeConfig: TypeAliasDeclarationStructure = {
    name: `${capitalizedBaseName}Type`,
    type: mappings.map(({ name }) => `"${name}"`).join(" | "),
    isExported: true,
  };
  sourceFile.addTypeAlias(typeConfig);

  const varConfig: VariableStatementStructure = {
    declarations: [{
      name: `${capitalizedBaseName}Events`,
      initializer: `[${events.map((event) => `"${event}"`).join(", ")}]`,
    }, {
      name: `${capitalizedBaseName}Types`,
      initializer: `[${mappings.map(({ name }) => `"${name}"`).join(", ")}]`,
    }],
    declarationType: VariableDeclarationType.Const,
    isExported: true,
  };
  sourceFile.addVariableStatement(varConfig);

  return events;
};

const customNotificationData: CodeGeneratorFn = (sourceFile, baseName, schema): void => {
  const events: string[] = commonData(sourceFile, baseName, schema, notificationTypeName);

  const mappings = events
    .map((event) => {
      const name = queryEventName(schema, event);
      return { event, name };
    });

  const notifications = sourceFile.getTypeAliasOrThrow(baseName);
  const notificationEvent = sourceFile.getEnumOrThrow(`${baseName}Event`);
  const notificationType = sourceFile.getInterfaceOrThrow(`I${baseName}Type`);
  notificationType.addExtends([`${notificationTypesName}<${sourceFile.getTypeAliasOrThrow(baseName).getName()}>`]);

  const interfaceConfig: InterfaceDeclarationStructure = { name: `I${baseName}Wrapper`, isExported: true };
  const typeConstraint = `${notificationHandlerName}<${notificationType.getName()}, ${notifications.getName()}>`;
  const typeConfig1: TypeAliasDeclarationStructure = {
    name: `${baseName}Constructor`,
    isExported: true,
    typeParameters: [{
      name: "T",
      constraint: typeConstraint,
    }],
    type: "new(...args: any[]) => T",
  };
  sourceFile.addTypeAlias(typeConfig1);
  const typeConfig2: TypeAliasDeclarationStructure = {
    name: `${baseName}WrapperConstructor`,
    isExported: true,
    type: `new(...args: any[]) => ${interfaceConfig.name}`,
  };
  sourceFile.addTypeAlias(typeConfig2);

  const argsParamName = "args";
  const superClassName = "Base";
  const typeParamName = "T";
  const callbackName = "cb";
  const classConfig: ClassDeclarationStructure = {
    name: `${baseName}Wrapper`,
    extends: superClassName,
    implements: [interfaceConfig.name],
    ctor: {
      parameters: [{
        name: argsParamName,
        isRestParameter: true,
      }],
      bodyText: `super(...${argsParamName});`,
    },
  };
  classConfig.methods = interfaceConfig.methods = events.map((event: string): MethodDeclarationStructure => {
    return {
      name: `on${pascalCase(event)}`,
      scope: Scope.Public,
      parameters: [{
        name: callbackName,
        type: `(notification: ${pascalCase(event)}) => void`,
      }],
      bodyText: `this.${onNotificationFnName}(${notificationEvent.getName()}.${notificationEvent.getMemberOrThrow(event).getName()}, ${callbackName});`,
      returnType: "void",
    };
  });
  sourceFile.addInterface(interfaceConfig);
  const functionConfig: FunctionDeclarationStructure = {
    name: `wrap${baseName}`,
    typeParameters: [{
      name: typeParamName,
      constraint: `${typeConfig1.name}<${typeConstraint}>`,
    }],
    parameters: [{
      name: superClassName,
      type: typeParamName,
    }],
    returnType: `${typeParamName} & ${typeConfig2.name}`,
    isExported: true,
  };
  const fn = sourceFile.addFunction(functionConfig);
  fn.addClass(classConfig);
  fn.setBodyText(`${fn.getBodyOrThrow().getChildSyntaxListOrThrow().getFullText()}\nreturn ${classConfig.name};`);
};

const customConsumerRequestData: CodeGeneratorFn = (sourceFile, baseName, schema) => {
  commonData(sourceFile, baseName, schema, iSendTypeName);
};

const customConsumerResponseData: CodeGeneratorFn = (sourceFile, baseName, schema) => {
  const baseRequestName = "ConsumerRequests";
  commonData(sourceFile, baseName, schema, iResponseTypeName);
  // TODO: how to automatically check that we map all requests (e.g. in the case when new events occurr)
  const mapping: { [key: string]: string } = {
    InitConnection: "StringResp",
    UpdateConversationField: "StringResp",
    ConsumerRequestConversation: "RequestConversationResponse",
    PublishEvent: "PublishEventResponse",
    SubscribeMessagingEvents: "GenericSubscribeResponse",
    SubscribeExConversations: "SubscribeExConversationsResponse",
    UnsubscribeExConversations: "StringResp",
  };

  const argsParamName = "args";
  const superClassName = "Base";
  const typeParamName = "T";
  const paramName = "data";

  const requestsEnumName = `${baseRequestName}Event`;

  const interfaceConfig: InterfaceDeclarationStructure = { name: `I${baseName}Wrapper`, isExported: true };
  const classConfig: ClassDeclarationStructure = {
    name: `${baseName}Wrapper`,
    extends: superClassName,
    implements: [interfaceConfig.name],
    ctor: {
      parameters: [{
        name: argsParamName,
        isRestParameter: true,
      }],
      bodyText: `super(...${argsParamName});`,
    },
  };
  classConfig.methods = interfaceConfig.methods = Object.entries(mapping).map(([req, res], a, b): MethodDeclarationStructure => {
    return {
      name: `do${pascalCase(req)}`,
      scope: Scope.Public,
      parameters: [{
        name: paramName,
        type: `Omit<${req}, "type">`, // TODO: not working as expected right now :/
      }],
      bodyText: `return this.${sendMessageFnName}(Object.assign(${paramName}, { type: ${requestsEnumName}.${req} }) as ${req});`,
      returnType: `Promise<${res}>`,
    };
  });
  sourceFile.addInterface(interfaceConfig);

  const typeConstraint = `${sendMessageHandlerName}<${baseRequestName}, ${baseName}>`;
  const typeConfig1: TypeAliasDeclarationStructure = {
    name: `${baseName}Constructor`,
    isExported: true,
    typeParameters: [{
      name: typeParamName,
      constraint: typeConstraint,
    }],
    type: `new(...args: any[]) => ${typeParamName}`,
  };
  sourceFile.addTypeAlias(typeConfig1);
  const typeConfig2: TypeAliasDeclarationStructure = {
    name: `${baseName}WrapperConstructor`,
    isExported: true,
    type: `new(...args: any[]) => ${interfaceConfig.name}`,
  };
  sourceFile.addTypeAlias(typeConfig2);

  const functionConfig: FunctionDeclarationStructure = {
    name: `wrap${baseName}`,
    typeParameters: [{
      name: typeParamName,
      constraint: `${typeConfig1.name}<${typeConstraint}>`,
    }],
    parameters: [{
      name: superClassName,
      type: typeParamName,
    }],
    returnType: `${typeParamName} & ${typeConfig2.name}`,
    isExported: true,
  };
  // TODO: introduce wrapping function
  // const fn = sourceFile.addFunction(functionConfig);
  // fn.addClass(classConfig);
  // fn.setBodyText(`${fn.getBodyOrThrow().getChildSyntaxListOrThrow().getFullText()}\nreturn ${classConfig.name};`);
};

const generateGenericTypings: CodeGeneratorFn = (sourceFile) => {
  const zooImportConfig: ImportDeclarationStructure = {
    moduleSpecifier: "type-zoo",
    namedImports: [{
      name: "Omit",
    }],
  };
  sourceFile.addImport(zooImportConfig);

  const typedName = "ITyped";
  const typedInterfaceConfig: InterfaceDeclarationStructure = {
    name: typedName,
    isExported: true,
    properties: [{
      name: "type",
      type: "string",
    }],
  };
  sourceFile.addInterface(typedInterfaceConfig);

  const sendInterfaceConfig: InterfaceDeclarationStructure = {
    name: iSendTypeName,
    isExported: true,
    extends: [typedName],
    properties: [{
      name: "id",
      type: "string",
    }],
  };
  sourceFile.addInterface(sendInterfaceConfig);

  const responseInterfaceConfig: InterfaceDeclarationStructure = {
    name: iResponseTypeName,
    isExported: true,
    extends: [typedName],
    properties: [{
      name: "reqId",
      type: "string",
    }],
  };
  sourceFile.addInterface(responseInterfaceConfig);

  const notificationInterfaceConfig: InterfaceDeclarationStructure = {
    name: notificationTypeName,
    isExported: true,
    extends: [typedName],
  };
  sourceFile.addInterface(notificationInterfaceConfig);

  const notificationTypesParamName = "NotificationType";
  const notificationTypesConfig: TypeAliasDeclarationStructure = {
    name: notificationTypesName,
    isExported: true,
    typeParameters: [{
      name: notificationTypesParamName,
      constraint: notificationInterfaceConfig.name,
    }],
    type: `{ [key: string]: ${notificationTypesParamName} }`,
  };
  sourceFile.addTypeAlias(notificationTypesConfig);

  const notificationTypeKeyName = "K";
  const notificationType = "NotificationType";
  const notificationTypes = "NotificationTypes";
  const notificationHandlerFn: MethodDeclarationStructure = {
    name: onNotificationFnName,
    parameters: [{
      name: "notificationType",
      type: notificationTypeKeyName,
    }, {
      name: "cb",
      type: `(notification: ${notificationTypes}[${notificationTypeKeyName}]) => void`,
    }],
    typeParameters: [{
      name: notificationTypeKeyName,
      constraint: `keyof ${notificationTypes}`,
    }],
    returnType: "void",
  };
  const notificationHandlerInterfaceConfig: InterfaceDeclarationStructure = {
    name: notificationHandlerName,
    isExported: true,
    typeParameters: [{
      name: notificationTypes,
      constraint: `${notificationTypesName}<${notificationType}>`,
    }, {
      name: notificationType,
      constraint: notificationTypeName,
    }],
    methods: [notificationHandlerFn],
  };
  sourceFile.addInterface(notificationHandlerInterfaceConfig);

  const sendTypeName = "SendType";
  const responseTypeName = "ResponseType";
  const sendMessageFn: MethodDeclarationStructure = {
    name: sendMessageFnName,
    parameters: [{
      name: "req",
      type: sendTypeName,
    }],
    returnType: `Promise<${responseTypeName}>`,
  };
  const sendMessageInterfaceConfig: InterfaceDeclarationStructure = {
    name: sendMessageHandlerName,
    isExported: true,
    typeParameters: [{
      name: sendTypeName,
      constraint: sendInterfaceConfig.name,
    }, {
      name: responseTypeName,
      constraint: responseInterfaceConfig.name,
    }],
    methods: [sendMessageFn],
  };
  sourceFile.addInterface(sendMessageInterfaceConfig);
};

const customAgentResponseData: CodeGeneratorFn = (schema, sourceFile, baseName) => {
  commonData(schema, sourceFile, baseName, iResponseTypeName);
  // TODO: after the agentRequests are working properly; see 'customConsumerResponseData'
};

const jsonSchemaUrls: ISchemaType[] = [
  // ordering is importent, requests need to be done before responses
  {url: "https://developers.liveperson.com/assets/schema/ws/consumerRequests.json", fn: customConsumerRequestData},
  {url: "https://developers.liveperson.com/assets/schema/ws/consumerResponses.json", fn: customConsumerResponseData},
  {url: "https://developers.liveperson.com/assets/schema/ws/consumerNotifications.json", fn: customNotificationData},
  // TODO: not working yet due to invalid JSON schema: {url: "https://developers.liveperson.com/assets/schema/ws/agentRequests.json"},
  {url: "https://developers.liveperson.com/assets/schema/ws/agentResponses.json", fn: customAgentResponseData},
  {url: "https://developers.liveperson.com/assets/schema/ws/agentNotifications.json", fn: customNotificationData},
  // {url: https://developers.liveperson.com/assets/schema/infra/stringResp.json}, // part of "consumerResponses.json" and "agentResponses.json",
];

(async () => {
  try {
    const schemaTypes = await Promise.all(jsonSchemaUrls.map(generateSchema));
    const test = schemaTypes.map((schemaType) => schemaType.schema)
      .reduce((previous, schema) => [...schema.anyOf, ...previous], []);

    const merged = jsonSchemaMerge({ anyOf: test });
    await writeJson(join(process.cwd(), "src", "ums_schema.json"), merged, { encoding: "utf8", flag: "w+", spaces: 2 });

    const file = join(process.cwd(), "src", "index.ts");
    const typings = await compile(merged, "UmsSchema", { enableConstEnums: true, bannerComment: "" });
    await remove(file); // remove old/previous versions
    const ast = new Ast();
    const sourceFile = ast.createSourceFile(file, typings);

    generateGenericTypings(sourceFile, "not_used", null);
    schemaTypes.filter((schemaType) => typeof schemaType.fn === "function")
      .forEach((schemaType) => Reflect.apply(schemaType.fn!, null, [sourceFile, pascalCase(basename(schemaType.url, extname(schemaType.url))), schemaType.schema]));

    sourceFile.insertText(0, header + autogeneratedBanner + "\n\n");
    sourceFile.formatText(tsFileFormat);
    await sourceFile.save();
  } catch (err) {
    // tslint:disable-next-line: no-console
    console.log("Failed to create typings file", err);
    return err;
  }
})();
