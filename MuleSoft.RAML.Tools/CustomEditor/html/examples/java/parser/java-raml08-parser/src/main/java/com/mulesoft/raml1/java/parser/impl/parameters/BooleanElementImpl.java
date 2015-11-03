package com.mulesoft.raml1.java.parser.impl.parameters;

import javax.xml.bind.annotation.XmlElement;
import com.mulesoft.raml1.java.parser.core.JavaNodeFactory;
import com.mulesoft.raml1.java.parser.model.parameters.BooleanElement;



public class BooleanElementImpl extends ParameterImpl implements BooleanElement {

    public BooleanElementImpl(Object jsNode, JavaNodeFactory factory){
        super(jsNode,factory);
    }

    protected BooleanElementImpl(){
        super();
    }



}