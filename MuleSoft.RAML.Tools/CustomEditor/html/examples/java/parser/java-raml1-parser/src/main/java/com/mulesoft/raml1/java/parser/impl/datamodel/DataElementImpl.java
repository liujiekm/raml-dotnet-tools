package com.mulesoft.raml1.java.parser.impl.datamodel;

import java.util.List;
import javax.xml.bind.annotation.XmlElement;
import com.mulesoft.raml1.java.parser.core.JavaNodeFactory;
import com.mulesoft.raml1.java.parser.impl.common.RAMLLanguageElementImpl;
import com.mulesoft.raml1.java.parser.model.datamodel.DataElement;
import com.mulesoft.raml1.java.parser.impl.datamodel.DataElementImpl;
import com.mulesoft.raml1.java.parser.model.datamodel.ModelLocation;
import com.mulesoft.raml1.java.parser.model.datamodel.LocationKind;
import com.mulesoft.raml1.java.parser.model.datamodel.ExampleSpec;
import com.mulesoft.raml1.java.parser.impl.datamodel.ExampleSpecImpl;



public class DataElementImpl extends RAMLLanguageElementImpl implements DataElement {

    public DataElementImpl(Object jsNode, JavaNodeFactory factory){
        super(jsNode,factory);
    }

    protected DataElementImpl(){
        super();
    }


    @XmlElement(name="name")
    public String name(){
        return super.getAttribute("name", String.class);
    }


    @XmlElement(name="facets")
    public List<DataElement> facets(){
        return super.getElements("facets", DataElementImpl.class);
    }


    @XmlElement(name="schema")
    public String schema(){
        return super.getAttribute("schema", String.class);
    }


    @XmlElement(name="usage")
    public String usage(){
        return super.getAttribute("usage", String.class);
    }


    @XmlElement(name="type")
    public List<String> type(){
        return super.getAttributes("type", String.class);
    }


    @XmlElement(name="location")
    public ModelLocation location(){
        return super.getAttribute("location", ModelLocation.class);
    }


    @XmlElement(name="locationKind")
    public LocationKind locationKind(){
        return super.getAttribute("locationKind", LocationKind.class);
    }


    @XmlElement(name="default")
    public String default_(){
        return super.getAttribute("default", String.class);
    }


    @XmlElement(name="example")
    public String example(){
        return super.getAttribute("example", String.class);
    }


    @XmlElement(name="repeat")
    public Boolean repeat(){
        return super.getAttribute("repeat", Boolean.class);
    }


    @XmlElement(name="examples")
    public List<ExampleSpec> examples(){
        return super.getElements("examples", ExampleSpecImpl.class);
    }


    @XmlElement(name="required")
    public Boolean required(){
        return super.getAttribute("required", Boolean.class);
    }
}