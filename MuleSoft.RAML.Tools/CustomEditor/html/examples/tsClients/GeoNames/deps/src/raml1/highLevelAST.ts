/// <reference path="../../typings/tsd.d.ts" />

/**
 * Created by kor on 05/05/15.
 */
import lowLevel = require("./lowLevelAST")
import ds=require("./definitionSystem")
import hi=require("./highLevelImpl")
import ParserCore=require("./parserCore");

export interface INamedEntity{
    name();
}

export interface ITypeDefinition extends INamedEntity {

    /**
     * list os super types
     */
    superTypes(): ITypeDefinition[];

    /**
     * list of sub types
     */
    subTypes(): ITypeDefinition[];

    /**
     * list of all subtypes not including this type
     */
    allSubTypes(): ITypeDefinition[];


    /**
     * List of all super types not including this type
     */
    allSuperTypes(): ITypeDefinition[];

    /**
     * Propertis decared in this type
     */
    properties(): IProperty[];

    /**
     *
     * List off all properties (declared in this type and super types)
     */
    allProperties(): IProperty[];

    /**
     * true if represents value type
     */
    isValueType(): boolean;

    isArray():boolean;

    toRuntime():ITypeDefinition;


    /**
     * true if this type values have internal structure
     */
    hasStructure(): boolean;

    /**
     * List of types whose instances may create descendants of this type at runtime
     */
    getRuntimeExtenders(): ITypeDefinition[];

    /**
     * List of value requirements for this type (fixed simple type descriminators)
     */
    valueRequirements(): { name: string; value: string } [];

    match(r: IParseResult, tp: ITypeDefinition): boolean;
   
    /**
     * parent universe
     */
    universe():IUniverse;
    
    isValid(h: IHighLevelNode, value: any, p: IProperty): any;
 
    /**
     * list of methods declared at this type //TODO better interface
     */
    methods(): { name: string; text: string } [];

    isAssignableFrom(typeName : string) : boolean;
}

export interface IUniverse {
    /**
     * type for a given name
     * @param name
     */
    getType(name): ITypeDefinition;
    /**
     * version of spec this universe is build
     */
    version(): string;

    /**
     * All types in universe
     */
    types():ITypeDefinition[]
}

export interface INodeDefinition extends ITypeDefinition{

    property(name:string):IProperty
    isAnnotation():boolean
    createStubNode(p:IProperty):IHighLevelNode
    allowValue():boolean;
    getExtendedType():ITypeDefinition
    isInlinedTemplates():boolean;
    isDeclaration():boolean
    description():string
    getAllowAny():boolean;
    getAllowQuestion():boolean;
    requiredProperties():IProperty[];
}
export interface IValueTypeDefinition extends ITypeDefinition{}

export interface IValueDocProvider{
    (v:string):string
}
export interface IValueSuggester{
    (node:IHighLevelNode):string[]
}

export interface IProperty extends INamedEntity{
    name():string
    description():string
    isEmbedMap():boolean
    matchKey(k:string):boolean
    range():ITypeDefinition
    isSelfNode():boolean
    domain():ITypeDefinition
    getKeyRegexp():string;
    isMultiValue():boolean
    isAllowNull():boolean
    valueDocProvider():IValueDocProvider;
    isMerged():boolean
    isFromParentValue():boolean;
    isRequired():boolean;
    isDescriminator():boolean;
    isValue():boolean;
    canBeValue():boolean;
    isKey():boolean;
    isFromParentKey():boolean;
    isReference():boolean
    isInherited(): boolean
    referencesTo():ITypeDefinition
    suggester():IValueSuggester
    keyPrefix():string
    defaultValue():string
    newInstanceName():string
    isSystem():boolean
    enumValues(c?:IHighLevelNode):string[]
    enumOptions():string[]
    referenceTargets(c:IHighLevelNode):IHighLevelNode[]
    childRestrictions():{name:string;value:any}[]
    createAttr(val:any):IAttribute;
    isThisPropertyDeclaresTypeFields():boolean;
    isValueProperty() : boolean;
    isTypeExpr() : boolean;
    priority() : number;
}

export interface IParseResult {
    hashkey(): string;
    lowLevel():lowLevel.ILowLevelASTNode
    expansionSpec():ExpansionSpec
    name():string
    root():IHighLevelNode
    
    parent():IHighLevelNode;
    setParent(node: IParseResult);
    
    children():IParseResult[];
    toRuntimeModel():any
    isAttached():boolean
    isImplicit():boolean
    isAttr():boolean
    isElement():boolean;
    localId():string
    isUnknown():boolean
    property():IProperty;
    id():string
    computedValue(name:string):any
    validate(acceptor:ValidationAcceptor):void
    printDetails(indent?:string):string
}
export interface ExpansionSpec{
    expansionSpec():IHighLevelNode
    expansionOfTemplate():IHighLevelNode
}
export interface Status{
    message:string
}
export enum IssueCode{
 UNRESOLVED_REFERENCE,
 YAML_ERROR,
 UNKNOWN_NODE,
 MISSING_REQUIRED_PROPERTY,
 PROPERTY_EXPECT_TO_HAVE_SINGLE_VALUE,
 //TODO IMPLEMENT
 KEY_SHOULD_BE_UNIQUE_INTHISCONTEXT,
 UNABLE_TO_RESOLVE_INCLUDE_FILE,
 INVALID_VALUE_SCHEMA,
 MISSED_CONTEXT_REQUIREMENT,
 NODE_HAS_VALUE,
 ONLY_OVERRIDE_ALLOWED
}
export interface ValidationAcceptor{
    begin()
    accept(issue: ValidationIssue);
    end();
}

export interface ValidationAction {
    name: string;
    action: () => void;
}

export interface ValidationIssue {
    code: IssueCode;
    message: string;
    node: IParseResult;
    path: string;
    start: number;
    end: number;
    isWarning: boolean;

    actions?: ValidationAction[];

    extras?:ValidationIssue[];
    unit?:lowLevel.ICompilationUnit;
}

export interface UnmatchedNode extends IParseResult {
    lowLevel(): lowLevel.ILowLevelASTNode;
    status(): Status;
}

export interface INodeBuilder {
    process(node: IHighLevelNode, childrenToAdopt: lowLevel.ILowLevelASTNode[]): IParseResult[];
}

export interface INodeExpander {
    process(node: IHighLevelNode, childrenToExpand: IParseResult[]): IParseResult[];
}

export interface IAttribute extends IParseResult {

    lowLevel(): lowLevel.ILowLevelASTNode;

    definition(): IValueTypeDefinition;

    property(): IProperty;

    value(): any;

    setValue(newValue: string|hi.StructuredValue);
    setValues(values: string[]);
    addValue(value: string|hi.StructuredValue);

    name(): string;
    toRuntime(): any;

    localId(): string;
    remove();

    isEmpty(): boolean;

    owningWrapper():{node:ParserCore.BasicSuperNode; property:string};

}

export interface IHighLevelNode extends IParseResult {

    lowLevel(): lowLevel.ILowLevelASTNode;


    expansionSpec(): ExpansionSpec;
    definition(): INodeDefinition;
    allowsQuestion(): boolean;
    property(): IProperty;

    children(): IParseResult[];

    attrs():IAttribute[];
    attr(n:string):IAttribute;
    attrOrCreate(n:string):IAttribute;
    attributes(n:string):IAttribute[];
    elements():IHighLevelNode[];
    element(n:string):IHighLevelNode;

    elementsOfKind(n: string): IHighLevelNode[];
    isExpanded(): boolean;

    value(): any;

    getExpandedVersion?(): IHighLevelNode;

    add(node: IHighLevelNode|IAttribute);
    remove(node: IHighLevelNode|IAttribute);

    dump(flavor: string): string;

    findElementAtOffset(offset: number);

    root(): IHighLevelNode;

    findReferences(): IParseResult[];

    copy(): IHighLevelNode;

    resetChildren():void

    findById(id:string);


    associatedType():INodeDefinition;

    wrapperNode():ParserCore.BasicSuperNode;

    setWrapperNode(node:ParserCore.BasicSuperNode);

}


/**
 * Do we need it?
 */
export interface IUnit extends IHighLevelNode {
    compilationUnit(): lowLevel.ICompilationUnit;

}

export interface ICoreLanguageService {

    universe(): ITypeDefinition[];
    getNodeBuilder(): INodeBuilder;
    createTextService(unit: IUnit): ITextEditingService;
    createBuilderService(node: IHighLevelNode): IBuilderService;
    getValidationService(): IValidationService;
    createSpecificationService(): ISpecificationWriter;
    serializeToString(node: IHighLevelNode): string;

}

interface CompletionProposal { }
interface SelectionProposal { }
interface QuickFixProposal { }
interface NodeTemplate { };

export interface IAcceptor<T> {
    calculationStarts();
    acceptProposal(c: T);
    calculationComplete();
}

export class Problem {
    code: number = 0;
    message: string;
    about: IParseResult;
    isOk() {
        return this.code == 0;
    }
}

export interface IUIAttribute {

}
export interface IBuilderService {
    nodeTemplates(): NodeTemplate;
    isRemovable(node: IParseResult): Problem[];
    canMove(node: IParseResult, newPosition: number): Problem[];
    canAdd(newNode: IParseResult, position: number): Problem[];
    editableAttributes(): IUIAttribute[];
}
/**
 * Text based service
 */
export interface ITextEditingService {

    codeComplete(offset: number, acceptor: IAcceptor<CompletionProposal>);

    codeSelect(offset: number, acceptor: IAcceptor<SelectionProposal>);

    quickFix(offset: number, acceptor: IAcceptor<QuickFixProposal>);

}
export interface ISpecificationWriter {
    writeSpec(): string;
}

interface IValidationService {
    validate(node: IHighLevelNode, acceptor: IAcceptor<Problem>);
}

export function ast2Object(node: IHighLevelNode): any {
    var result = {};
    node.attrs().forEach(x=> {
        result[x.property().name()] = x.value();
    });
    
    node.elements().forEach(x => {
        var m = result[x.property().name()];
        
        if (Array.isArray(m)) {
            (<any[]>m).push(ast2Object(x))
        }
        
        result[x.property().name()] = x.property().isMultiValue() ? [ast2Object(x)] : ast2Object(x);         
    })
    return result;
}


export var universeProvider = require("./universeProvider");
import hlImpl=require("./highLevelImpl")
export var getDefinitionSystemType = function (contents:string,ast:lowLevel.ILowLevelASTNode) {

    var spec = "";
    var ptype = "Api";
    var num = 0;
    var pt = 0;
    
    for (var n = 0; n < contents.length; n++) {
        var c = contents.charAt(n);
        if (c == '\r' || c == '\n') {
            if (spec) {
                ptype = contents.substring(pt, n).trim();
            }
            else {
                spec = contents.substring(0, n).trim();
            }
            break;
        }
        if (c == ' ') {
            num++;
            if (!spec && num == 2) {
                spec = contents.substring(0, n);
                pt = n;
            }
        }
    }
    var localUniverse = spec == "#%RAML 1.0" ? new ds.Universe("RAML10", universeProvider("RAML10"),"RAML10") : new ds.Universe("RAML08", universeProvider("RAML08"));
    if (ast) {
        if (ast.children().filter(x=>x.key() == "swagger").length > 0) {
            localUniverse = new ds.Universe("Swagger", universeProvider("Swagger2"), "Swagger");
            ptype = "SwaggerObject";
        }
    }

    localUniverse.setTopLevel(ptype);
    localUniverse.setTypedVersion(spec);
    // localUniverse.setDescription(spec);
    return { ptype: ptype, localUniverse: localUniverse };
};

export function fromUnit(l: lowLevel.ICompilationUnit): IParseResult {
    if (l == null)
        return null;
    
    var contents = l.contents();
    var ast = l.ast();
    var __ret = getDefinitionSystemType(contents, ast);
    var ptype = __ret.ptype;
    var localUniverse = __ret.localUniverse;
    var apiType = localUniverse.type(ptype)

    if (!apiType) apiType = localUniverse.type("Api");
    
    var api = new hlImpl.ASTNodeImpl(ast, null, <any>apiType, null);
    api.setUniverse(localUniverse);
    return api;
}

export function globalId(h: IParseResult) {
    if (h.parent()) {
        return globalId(h.parent()) + "/" + h.localId();
    }
}

export function nodeAtPosition(h: IParseResult, position: number) {
    var ch = h.children();
    var len = ch.length;
    var res: IParseResult = null;
    for (var num = 0; num < len; num++) {
        var cn = ch[num];
        if (cn.lowLevel().start() > position) {
            break;
        }
        if (cn.lowLevel().end() < position) {
            continue;
        }
        var nm = nodeAtPosition(cn, position);
        if (nm != null) {
            return nm;
        }
        return cn;
    }
}
